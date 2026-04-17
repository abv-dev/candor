use serde_json::Value;
use tauri::Manager;

#[tauri::command]
async fn fetch_live_game_data() -> Result<Value, String> {
    let client = reqwest::Client::builder()
        .danger_accept_invalid_certs(true)
        .timeout(std::time::Duration::from_millis(1500))
        .build()
        .map_err(|e| format!("client build: {e}"))?;

    let res = client
        .get("https://127.0.0.1:2999/liveclientdata/allgamedata")
        .send()
        .await
        .map_err(|e| format!("fetch: {e}"))?;

    if res.status() == reqwest::StatusCode::NOT_FOUND {
        return Err("NO_GAME".to_string());
    }

    if !res.status().is_success() {
        return Err(format!("HTTP {}", res.status()));
    }

    res.json::<Value>().await.map_err(|e| format!("parse: {e}"))
}

fn is_lol_focused() -> bool {
    match active_win_pos_rs::get_active_window() {
        Ok(info) => {
            let needle = "league";
            let process = info.process_name.to_lowercase();
            let app = info.app_name.to_lowercase();
            let title = info.title.to_lowercase();
            process.contains(needle) || app.contains(needle) || title.contains(needle)
        }
        Err(_) => false,
    }
}

fn start_focus_watcher(app_handle: tauri::AppHandle) {
    std::thread::spawn(move || {
        let mut last_visible: Option<bool> = None;
        loop {
            std::thread::sleep(std::time::Duration::from_millis(400));
            let should_show = is_lol_focused();
            if last_visible == Some(should_show) {
                continue;
            }
            last_visible = Some(should_show);

            if let Some(overlay) = app_handle.get_webview_window("overlay") {
                let _ = if should_show {
                    overlay.show()
                } else {
                    overlay.hide()
                };
            }
        }
    });
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![fetch_live_game_data])
        .setup(|app| {
            start_focus_watcher(app.handle().clone());
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
