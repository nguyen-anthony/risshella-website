# Trello Issue Reporting Setup

This guide explains how to set up Trello API integration for issue reporting instead of GitHub issues.

## Prerequisites

1. A Trello account
2. A Trello board where you want to collect issues
3. A specific list on that board for new issue cards

## Step 1: Get Your Trello API Key

1. Go to [Trello Power-Ups Admin Panel](https://trello.com/power-ups/admin)
2. Click "New" to create a new Power-Up (or use an existing one)
3. Copy your API Key from the "API Key" section

## Step 2: Get Your Trello Token

1. Visit this URL (replace `YOUR_API_KEY` with your actual API key):
   ```
   https://trello.com/1/authorize?expiration=never&name=risshella-website&scope=read,write&response_type=token&key=YOUR_API_KEY
   ```
2. Authorize the application and copy the token

## Step 3: Get Your List ID

1. Open your Trello board in a web browser
2. Go to the list where you want new issue cards to be created
3. Add `.json` to the end of the board URL to see the JSON data, e.g.:
   ```
   https://trello.com/b/BOARD_ID.json
   ```
4. Find your list in the `lists` array and copy the `id` field

## Step 4: Configure Environment Variables

Add these environment variables to your `.env.local` file:

```env
TRELLO_API_KEY=your_api_key_here
TRELLO_TOKEN=your_token_here
TRELLO_LIST_ID=your_list_id_here
```

## Step 5: Test the Integration

1. Start your development server
2. Navigate to a page with the Issue Report button
3. Submit a test issue/feature request
4. Check your Trello board to confirm the card was created

## Card Format

New cards will be created with:
- **Name**: `🐛 Bug Report: [short description]` or `✨ Feature Request: [short description]`
- **Description**: Formatted with type, full description, and attribution
- **Position**: Added to the top of the list

## Troubleshooting

- **403 Forbidden**: Check that your token has write permissions
- **Invalid list ID**: Double-check the list ID from the JSON data
- **Rate limiting**: Trello has rate limits; if exceeded, wait before retrying

## Security Notes

- Keep your API key and token secure
- Never commit them to version control
- Consider rotating tokens periodically
- The token has full read/write access to your Trello account