#!/bin/bash

echo "🔍 REAL CONTENT SEARCH - Now Searching Actual Available Shows!"
echo "=============================================================="

echo ""
echo "🆕 What's Fixed:"
echo "• Search now queries backend API instead of static database"
echo "• Results show only content that actually exists in your library"
echo "• Real-time search of your video collection"
echo "• Fallback to static database if API fails"

echo ""
echo "🎯 Test the Real Content Search:"
echo ""
echo "1. 🌐 Open: http://localhost:3050"
echo "2. 🔍 Click the search icon in the navbar (top-right)"
echo "3. 🔤 Type searches for content you actually have:"

echo ""
echo "📺 Try These Searches (Real Content Available):"
echo ""
echo "• 'attack' → Should find 'Attack on Titan'"
echo "• 'demon' → Should find 'Demon Slayer'"
echo "• 'go' → Should find 'Go! Go! Loser Ranger!'"
echo "• 'spirited' → Should find 'Spirited Away'"

echo ""
echo "🔍 How It Works Now:"
echo ""
echo "• Backend scans /content folder for real video files"
echo "• Search API returns only available content"
echo "• Results include working video links"
echo "• Click any result → Goes to actual show page"

echo ""
echo "🎬 Available Content in Your Library:"
echo ""
curl -s "http://localhost:3051/api/search?q=" | grep -o '"title":"[^"]*"' | sed 's/"title":"//g' | sed 's/"//g' | head -10 | while read title; do
  echo "  ✅ $title"
done

echo ""
echo "🔍 Test Backend Search API Directly:"
echo ""
echo "# Search for 'attack':"
echo "curl \"http://localhost:3051/api/search?q=attack\""
echo ""
echo "# Search for 'demon':"
echo "curl \"http://localhost:3051/api/search?q=demon\""

echo ""
echo "🌐 Ready to test real content search: http://localhost:3050"
echo "🎬 Search will now show only the shows you actually have!"

echo ""
echo "📊 Container Status:"
podman-compose ps --format="table {{.Names}}\\t{{.Status}}"