variable "resource_group_name"{
    default = "receipt-recall-rg"
}

variable "location" {
    default = "Canada Central"
}

variable "app_service_plan_name"{
    default = "receipt-recall-plan"
}

variable "web_app_name"{
    default = "receipt-recall-api"
}

variable "postgres_server_name" {
    default = "receipt-recall-db"
}

variable "postgres_admin_user" {
  default = "recalladmin"
}

variable "postgres_admin_password"{
    sensitive = true
}

variable "storage_account_name" {
default = "recallartifacts"
}

variable "local_jenkins_ip" {
  description = "Public IP of the machine running Jenkins locally — allows Prisma migrations to reach Azure PostgreSQL"
}