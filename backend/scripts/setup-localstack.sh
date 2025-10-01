#!/bin/bash

echo "Setting up SES in LocalStack..."

# Verify email identities for testing
aws --endpoint-url http://localhost:4566 ses verify-email-identity --email-address noreply@example.com
aws --endpoint-url http://localhost:4566 ses verify-email-identity --email-address test@example.com

echo "SES setup complete"
