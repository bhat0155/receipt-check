terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"    
      }
  }
}

# Configure the Microsoft Azure Provider
provider "azurerm" {

  features {}
}

# resource group
resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location
}

# app service plan
  resource "azurerm_service_plan" "main" {
    name                = var.app_service_plan_name
    resource_group_name = azurerm_resource_group.main.name
    location            = azurerm_resource_group.main.location
    os_type             = "Linux"
    sku_name            = "B1"
  }


# Linux Web App
resource "azurerm_linux_web_app" "main" {
  name                = var.web_app_name
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  service_plan_id     = azurerm_service_plan.main.id

  site_config {
    application_stack {
        node_version = "22-lts"
      }
      app_command_line = "node dist/server.js"
  }
   app_settings = {
      "WEBSITE_RUN_FROM_PACKAGE" = "1"
      "NODE_ENV"                 = "production"
    }
}


# postgres server + database + firewall
  resource "azurerm_postgresql_flexible_server" "main" {
    name                   = var.postgres_server_name
    resource_group_name    = azurerm_resource_group.main.name
    location               = azurerm_resource_group.main.location
    version                = "16"
    administrator_login    = var.postgres_admin_user
    administrator_password = var.postgres_admin_password
    sku_name               = "B_Standard_B1ms"
    storage_mb             = 32768
    backup_retention_days  = 7
    zone                   = "3"
  }

  resource "azurerm_postgresql_flexible_server_database" "main" {
  name      = "receipt_recall_db"
  server_id = azurerm_postgresql_flexible_server.main.id
  collation = "en_US.utf8"
  charset   = "UTF8"
}

 resource "azurerm_postgresql_flexible_server_firewall_rule" "azure_services" {
    name             = "AllowAzureServices"
    server_id        = azurerm_postgresql_flexible_server.main.id
    start_ip_address = "0.0.0.0"
    end_ip_address   = "0.0.0.0"
  }

  # allows local Jenkins to run Prisma migrations against Azure PostgreSQL
  resource "azurerm_postgresql_flexible_server_firewall_rule" "local_jenkins" {
    name             = "AllowLocalJenkins"
    server_id        = azurerm_postgresql_flexible_server.main.id
    start_ip_address = var.local_jenkins_ip
    end_ip_address   = var.local_jenkins_ip
  }

  # storage account + container
  resource "azurerm_storage_account" "artifacts" {
  name                     = var.storage_account_name
  resource_group_name      = azurerm_resource_group.main.name
  location                 = var.location
  account_tier             = "Standard"
  account_replication_type = "LRS"

  tags = {
    environment = "staging"
  }
}

 resource "azurerm_storage_container" "artifacts" {
    name                  = "jenkins-artifacts"
  storage_account_id    = azurerm_storage_account.artifacts.id
    container_access_type = "private"
  }