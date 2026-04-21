use std::fs;
use std::io;
use std::io::Write;
use std::path::Path;
use walkdir::WalkDir;
use zip::CompressionMethod;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct LintIssue {
    level: String, // "error" | "warning"
    message: String,
    file: Option<String>,
}

#[tauri::command]
async fn lint_project(source_path: String) -> Result<Vec<LintIssue>, String> {
    let mut issues = Vec::new();
    let root = Path::new(&source_path);

    // 1. Mimetype 检查
    let mimetype_path = root.join("mimetype");
    if !mimetype_path.exists() {
        issues.push(LintIssue {
            level: "error".to_string(),
            message: "缺失 mimetype 文件，这会导致 EPUB 格式无效。".to_string(),
            file: None,
        });
    } else {
        let content = fs::read_to_string(&mimetype_path).unwrap_or_default();
        if content.trim() != "application/epub+zip" {
            issues.push(LintIssue {
                level: "error".to_string(),
                message: "mimetype 文件内容不正确，应为 'application/epub+zip'。".to_string(),
                file: Some("mimetype".to_string()),
            });
        }
    }

    // 2. 容器检查
    let container_path = root.join("META-INF/container.xml");
    if !container_path.exists() {
        issues.push(LintIssue {
            level: "error".to_string(),
            message: "缺失 META-INF/container.xml，书籍将无法被阅读器识别。".to_string(),
            file: None,
        });
    }

    // 3. OPF 清单对比检查
    // 寻找 OPF 文件 (通常在 OEBPS 目录下)
    let mut opf_path = None;
    for entry in WalkDir::new(root).into_iter().filter_map(|e| e.ok()) {
        if entry.path().extension().and_then(|s| s.to_str()) == Some("opf") {
            opf_path = Some(entry.path().to_owned());
            break;
        }
    }

    if let Some(path) = opf_path {
        let opf_content = fs::read_to_string(&path).unwrap_or_default();
        let opf_dir = path.parent().unwrap_or(root);
        
        // 收集所有物理文件 (相对于根目录)
        let mut physical_files = Vec::new();
        for entry in WalkDir::new(root).into_iter().filter_map(|e| e.ok()) {
            if entry.path().is_file() {
                let rel_path = entry.path().strip_prefix(root).unwrap_or(entry.path());
                let name = rel_path.to_string_lossy().to_string();
                if !name.starts_with('.') && name != "mimetype" {
                    physical_files.push(name);
                }
            }
        }

        // 简易解析 Manifest Href (正则匹配)
        // 匹配 <item id="..." href="filename.xhtml" ... />
        let mut manifest_hrefs = Vec::new();
        let href_regex = regex::Regex::new(r#"href="([^"]+)""#).unwrap();
        for cap in href_regex.captures_iter(&opf_content) {
            manifest_hrefs.push(cap[1].to_string());
        }

        // A. 孤儿文件检查：物理存在但清单没提
        for phys in &physical_files {
            // 跳过 OPF 自己和 container.xml
            if phys.ends_with(".opf") || phys.contains("container.xml") {
                continue;
            }
            // 提取物理文件名进行对比 (EPUB 规范中 href 通常是相对 OPF 的)
            let phys_name = Path::new(phys).file_name().unwrap_or_default().to_string_lossy();
            if !manifest_hrefs.iter().any(|h| h.contains(phys_name.as_ref())) {
                issues.push(LintIssue {
                    level: "warning".to_string(),
                    message: format!("文件 '{}' 未在资源清单 (Manifest) 中声明，打包时将被忽略。", phys),
                    file: Some(phys.clone()),
                });
            }
        }

        // B. 死链检查：清单提了但物理不存在
        for href in &manifest_hrefs {
            let target_path = opf_dir.join(href);
            if !target_path.exists() {
                issues.push(LintIssue {
                    level: "error".to_string(),
                    message: format!("清单引用的文件 '{}' 在磁盘上不存在。", href),
                    file: Some(href.clone()),
                });
            }
        }
    } else {
        issues.push(LintIssue {
            level: "error".to_string(),
            message: "未找到 .opf 配置文件，无法进行完整性校验。".to_string(),
            file: None,
        });
    }

    Ok(issues)
}

#[tauri::command]
async fn package_epub(source_path: String, target_path: String) -> Result<(), String> {
    let file = fs::File::create(&target_path).map_err(|e| e.to_string())?;
    let mut zip = zip::ZipWriter::new(file);

    let options = zip::write::FileOptions::<()>::default()
        .compression_method(CompressionMethod::Stored)
        .unix_permissions(0o644);
    
    zip.start_file("mimetype", options).map_err(|e| e.to_string())?;
    zip.write_all(b"application/epub+zip").map_err(|e| e.to_string())?;

    let options = zip::write::FileOptions::<()>::default()
        .compression_method(CompressionMethod::Deflated)
        .unix_permissions(0o644);

    for entry in WalkDir::new(&source_path).into_iter().filter_map(|e| e.ok()) {
        let path = entry.path();
        let name = path.strip_prefix(Path::new(&source_path)).map_err(|e| e.to_string())?;

        if name.as_os_str() == "mimetype" || name.as_os_str() == "" {
            continue;
        }

        if path.is_file() {
            zip.start_file(name.to_string_lossy(), options).map_err(|e| e.to_string())?;
            let f = fs::File::open(path).map_err(|e| e.to_string())?;
            let mut reader = io::BufReader::new(f);
            io::copy(&mut reader, &mut zip).map_err(|e| e.to_string())?;
        } else if !name.as_os_str().is_empty() {
            zip.add_directory(name.to_string_lossy(), options).map_err(|e| e.to_string())?;
        }
    }

    zip.finish().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn import_epub(source_path: String, target_path: String) -> Result<(), String> {
    let file = fs::File::open(&source_path).map_err(|e| e.to_string())?;
    let mut archive = zip::ZipArchive::new(file).map_err(|e| e.to_string())?;

    for i in 0..archive.len() {
        let mut file = archive.by_index(i).map_err(|e| e.to_string())?;
        let outpath = match file.enclosed_name() {
            Some(path) => Path::new(&target_path).join(path),
            None => continue,
        };

        if (*file.name()).ends_with('/') {
            fs::create_dir_all(&outpath).map_err(|e| e.to_string())?;
        } else {
            if let Some(p) = outpath.parent() {
                if !p.exists() {
                    fs::create_dir_all(p).map_err(|e| e.to_string())?;
                }
            }
            let mut outfile = fs::File::create(&outpath).map_err(|e| e.to_string())?;
            io::copy(&mut file, &mut outfile).map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![package_epub, import_epub, lint_project])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
