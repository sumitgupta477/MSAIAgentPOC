resource "aws_dynamodb_table" "cases" {
  name         = "CasesTable"
  billing_mode = "PAY_PER_REQUEST"

  hash_key = "case_id"

  attribute {
    name = "case_id"
    type = "S"
  }
}