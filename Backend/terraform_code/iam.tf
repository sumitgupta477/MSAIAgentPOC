resource "aws_iam_role" "lambda_role" {
  name = "ai-case-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_policy" "lambda_policy" {
  name = "ai-case-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [

      # Logs
      {
        Effect = "Allow"
        Action = ["logs:*"]
        Resource = "*"
      },

      # DynamoDB
      {
        Effect = "Allow"
        Action = ["dynamodb:PutItem"]
        Resource = aws_dynamodb_table.cases.arn
      },

      # SES
      {
        Effect = "Allow"
        Action = ["ses:SendEmail"]
        Resource = "*"
      },

      # Bedrock
      {
        Effect = "Allow"
        Action = ["bedrock:InvokeModel"]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "attach" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_policy.arn
}
