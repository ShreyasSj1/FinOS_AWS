output "api_gateway_endpoint" {
  description = "The HTTP invoke URL for the aws-finos API Gateway"
  value       = aws_apigatewayv2_stage.default_stage.invoke_url
}

output "cloudfront_distribution_domain" {
  description = "The CloudFront CDN domain name serving the frontend application"
  value       = aws_cloudfront_distribution.web_cdn.domain_name
}

output "s3_website_endpoint" {
  description = "The S3 website endpoint"
  value       = aws_s3_bucket_website_configuration.web_config.website_endpoint
}

output "dynamodb_table_name" {
  description = "The DynamoDB governance state table"
  value       = aws_dynamodb_table.governance_store.name
}
