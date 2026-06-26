output "web_app_url" {
      value = "https://${azurerm_linux_web_app.main.default_hostname}"
}

output "postgres_host" {
      value = azurerm_postgresql_flexible_server.main.fqdn
}

output "storage_account_name" {
      value = azurerm_storage_account.artifacts.name
}

output "artifact_container" {
      value = azurerm_storage_container.artifacts.name
}