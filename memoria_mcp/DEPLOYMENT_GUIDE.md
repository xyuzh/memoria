# Firebase Deployment Guide

## ⚠️ Prerequisites

Your Firebase project must be on the **Blaze (pay-as-you-go) plan** to deploy Functions.

### Upgrade to Blaze Plan:
1. Visit: https://console.firebase.google.com/project/alpha-nice/usage/details
2. Click "Upgrade" and select the Blaze plan
3. Add your billing information (you only pay for what you use beyond free tier)

## 📝 Pre-Deployment Checklist

✅ Firebase configuration updated (`.firebaserc`)
✅ Weaviate credentials configured
✅ TypeScript compiled successfully
✅ All dependencies installed

## 🚀 Deployment Steps

### 1. Set Environment Variables (Already Done)
```bash
firebase functions:config:set \
  weaviate.url="cluster-ccscpzfo.weaviate.network" \
  weaviate.api_key="eHb1pVaH7zXCijeM7RKzMVCOzg0QXnSP9NZy"
```

### 2. Deploy Everything
```bash
firebase deploy
```

Or deploy components separately:

```bash
# Deploy Functions only
firebase deploy --only functions

# Deploy Hosting only
firebase deploy --only hosting
```

### 3. Verify Deployment

After successful deployment, your services will be available at:

- **MCP Server**: https://us-central1-alpha-nice.cloudfunctions.net/mcpMemoryServer
- **Visualization**: https://alpha-nice.web.app/visualize.html
- **Health Check**: https://us-central1-alpha-nice.cloudfunctions.net/mcpMemoryServer/health

## 🔧 Configure Claude Desktop

Add this to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "firebase-memory": {
      "command": "node",
      "args": ["/Users/xinyu/code/hackthon/memoria/memoria_mcp/mcp-client-adapter.js"],
      "env": {
        "FIREBASE_ENDPOINT": "https://us-central1-alpha-nice.cloudfunctions.net/mcpMemoryServer",
        "FIREBASE_API_KEY": "AIzaSyAin2S8Y-oBvpnkRI9p9OoRFEpQ9ElUNNo",
        "FIREBASE_AUTH_DOMAIN": "alpha-nice.firebaseapp.com",
        "FIREBASE_PROJECT_ID": "alpha-nice"
      }
    }
  }
}
```

## 🧪 Test Your Deployment

### Test Health Endpoint
```bash
curl https://us-central1-alpha-nice.cloudfunctions.net/mcpMemoryServer/health
```

### Test MCP Tools List
```bash
curl -X POST https://us-central1-alpha-nice.cloudfunctions.net/mcpMemoryServer/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

### Test Memory Stats (Public)
```bash
curl https://us-central1-alpha-nice.cloudfunctions.net/mcpMemoryServer/api/memories/stats
```

## 📊 Monitor Your Deployment

- **Firebase Console**: https://console.firebase.google.com/project/alpha-nice
- **Functions Logs**: `firebase functions:log`
- **Usage & Billing**: https://console.firebase.google.com/project/alpha-nice/usage

## 🔒 Security Notes

1. The Weaviate API key is stored securely in Firebase Functions config
2. Authentication is optional for visualization endpoints
3. MCP endpoints require Firebase Auth tokens
4. Consider adding rate limiting for production use

## 💡 Next Steps

1. Upgrade to Blaze plan
2. Run `firebase deploy`
3. Test the endpoints
4. Configure Claude Desktop
5. Access visualization at https://alpha-nice.web.app/visualize.html

## 🆘 Troubleshooting

If deployment fails:
- Check Firebase CLI is logged in: `firebase login`
- Verify project: `firebase use alpha-nice`
- Check Functions logs: `firebase functions:log`
- Ensure Blaze plan is active

## 📈 Cost Estimates

With Firebase Blaze plan (pay-as-you-go):
- **Free tier includes**: 2M function invocations/month, 400K GB-seconds, 200K CPU-seconds
- **Estimated cost**: $0-5/month for light usage
- **Monitor usage**: Firebase Console > Project Settings > Usage & Billing