# Logging Guidelines

Use structured JSON logs with the keys `level`, `message`, and `context`.

```ts
console.info(JSON.stringify({ level: 'info', message: 'service started', context: { requestId } }))
console.error(JSON.stringify({ level: 'error', message: err.message, context: { requestId } }))
```

Include a `requestId` whenever available to aid traceability.
