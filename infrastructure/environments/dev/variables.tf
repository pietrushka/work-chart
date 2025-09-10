variable "service_name" {
  type        = string
  description = "Name of the deployed service."

  validation {
    condition     = length(var.service_name) > 0
    error_message = "No name of the deployed service provided."
  }
}

variable "environment" {
  type        = string
  description = "Name of the environment."

  validation {
    condition     = length(var.environment) > 0
    error_message = "No name of the environment provided."
  }
}

variable "aws_region" {
  type        = string
  description = "Name of the AWS region."

  validation {
    condition     = length(var.aws_region) > 0
    error_message = "No name of the aws region provided."
  }
}
