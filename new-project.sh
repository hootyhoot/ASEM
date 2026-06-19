#!/usr/bin/env bash
# Usage: ./new-project.sh <slug>
# Example: ./new-project.sh line-follower-v2

set -e

SLUG="${1//[^a-zA-Z0-9_-]/}"
if [ -z "$SLUG" ]; then
  echo "Usage: ./new-project.sh <project-slug>"
  echo "Example: ./new-project.sh line-follower-v2"
  exit 1
fi

DIR="projects/$SLUG"
if [ -d "$DIR" ]; then
  echo "Error: $DIR already exists."
  exit 1
fi

mkdir -p "$DIR/images"

cat > "$DIR/meta.json" << EOF
{
  "title": "My Project Title",
  "date": "$(date +%Y-%m-%d)",
  "description": "Describe what the robot does, how you built it, and what you learned.",
  "tags": ["Tag1", "Tag2"],
  "cover": "01.jpg",
  "images": ["01.jpg", "02.jpg", "03.jpg"]
}
EOF

echo ""
echo "Created $DIR/"
echo ""
echo "Next steps:"
echo "  1. Edit $DIR/meta.json — update title, description, tags, date"
echo "  2. Drop images into $DIR/images/ (name them 01.jpg, 02.jpg, etc.)"
echo "  3. Set 'cover' in meta.json to your hero image filename"
echo "  4. Add \"$SLUG\" to projects/projects.json"
echo "  5. git add . && git commit -m 'add project: $SLUG' && git push"
echo ""
