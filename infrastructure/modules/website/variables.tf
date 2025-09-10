variable "environment" {
  type        = string
  description = "Name of environment."

  validation {
    condition     = length(var.environment) > 0
    error_message = "No environment name provided."
  }
}

variable "service_name" {
  type        = string
  description = "Name of deployed service."

  validation {
    condition     = length(var.service_name) > 0
    error_message = "No service name provided."
  }
}

variable "bucket_name" {
  type        = string
  description = "Name of deployed bucket."

  validation {
    condition     = length(var.bucket_name) > 0
    error_message = "No bucket name provided."
  }
}

variable "aws_region" {
  type        = string
  description = "Name of AWS Region."

  validation {
    condition     = length(var.aws_region) > 0
    error_message = "No AWS region provided."
  }
}


variable "tags" {
  type        = map(string)
  description = "Resource recognition tags."
  default     = {}
}

