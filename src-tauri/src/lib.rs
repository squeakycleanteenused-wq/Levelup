use reqwest::Client;
use tauri::State;

const BASE: &str = "https://stuudium.com"; // PLACEHOLDER: kontrolli päris aadress

/// Sessioon (küpsised) elab ainult mälus. Parooli kettale ei salvestata.
struct Session(Client);

#[tauri::command]
async fn stuudium_login(
    session: State<'_, Session>,
    username: String,
    password: String,
) -> Result<(), String> {
    // PLACEHOLDER: päris vormi väljade nimed ja URL tuleb Stuudiumi lehelt.
    let res = session
        .0
        .post(format!("{BASE}/login"))
        .form(&[("username", username), ("password", password)])
        .send()
        .await
        .map_err(|e| e.to_string())?;
    if res.status().is_success() || res.status().is_redirection() {
        Ok(())
    } else {
        Err(format!("Sisselogimine ebaõnnestus ({})", res.status()))
    }
}

#[tauri::command]
async fn stuudium_get(session: State<'_, Session>, path: String) -> Result<String, String> {
    if !path.starts_with('/') {
        return Err("Vigane tee".into());
    }
    session
        .0
        .get(format!("{BASE}{path}"))
        .send()
        .await
        .map_err(|e| e.to_string())?
        .text()
        .await
        .map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let client = Client::builder().cookie_store(true).build().expect("http client");
    tauri::Builder::default()
        .manage(Session(client))
        .invoke_handler(tauri::generate_handler![stuudium_login, stuudium_get])
        .run(tauri::generate_context!())
        .expect("tauri viga");
}
