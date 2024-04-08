# Webhook Action
This action sends a webhook with repository details and additional data.

## Inputs
`data`
Required Additional data to send with the webhook. This should be a JSON string.

`webhook-url`
Required The URL to send the webhook to.

`bearer-token`
Required The bearer token for authorization.

## Example usage

```yml
steps:
- name: Run Webhook Action
  uses: davidakerr/actions@main
  with:
    data: |
        {
            "key": "value"
        }
    webhook-url: ${{ secrets.WEBHOOK_URL }}
    bearer-token: ${{ secrets.BEARER_TOKEN }}
```