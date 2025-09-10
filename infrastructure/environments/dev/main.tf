module "website" {
  source = "../../modules/website"

  service_name = var.service_name
  bucket_name  = "website"
  environment  = var.environment
  aws_region   = var.aws_region

  tags = {
    Environment = var.environment
    Project     = var.service_name
  }
}
