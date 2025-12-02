#!/bin/bash
# Rebranding Script: bGen → aiGen (binomOne.aiGen)
# Author: Knörr Raphael
# Brand: binomOne

echo "🔄 Starting Rebranding: bGen → aiGen (binomOne)"
echo "================================================"

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Counters
total_files=0
total_replacements=0

# Function to replace in file
replace_in_file() {
    local file="$1"
    local changed=0

    # Skip node_modules, .git, dist, build directories
    if [[ "$file" == *"node_modules"* ]] || [[ "$file" == *".git"* ]] || \
       [[ "$file" == *"dist/"* ]] || [[ "$file" == *"build/"* ]]; then
        return 0
    fi

    # Create backup
    cp "$file" "$file.bak"

    # Perform replacements
    sed -i 's/bGen/aiGen/g' "$file"
    sed -i 's/bgen/aigen/g' "$file"
    sed -i 's/BGEN/AIGEN/g' "$file"
    sed -i 's/B-Gen/aiGen/g' "$file"
    sed -i 's/b-gen/aigen/g' "$file"

    # Replace Claude references
    sed -i 's/Generated with \[Claude Code\](https:\/\/claude\.com\/claude-code)/Developed by Knörr Raphael | binomOne.aiGen/g' "$file"
    sed -i 's/Co-Authored-By: Claude <noreply@anthropic\.com>/Author: Knörr Raphael <info@binomone.com>/g' "$file"
    sed -i 's/Claude Code/binomOne.aiGen/g' "$file"
    sed -i 's/claude-code/binomone-aigen/g' "$file"

    # Check if file changed
    if ! cmp -s "$file" "$file.bak"; then
        changed=1
        rm "$file.bak"
    else
        mv "$file.bak" "$file"
    fi

    return $changed
}

# Find all relevant files
echo -e "${BLUE}Scanning for files...${NC}"

file_types=(
    "*.json"
    "*.md"
    "*.js"
    "*.ts"
    "*.tsx"
    "*.jsx"
    "*.html"
    "*.sh"
    "*.txt"
    "*.env*"
)

for type in "${file_types[@]}"; do
    while IFS= read -r file; do
        if replace_in_file "$file"; then
            ((total_replacements++))
            echo -e "${GREEN}✓${NC} Updated: $file"
        fi
        ((total_files++))
    done < <(find . -type f -name "$type" 2>/dev/null | grep -v node_modules | grep -v .git)
done

echo ""
echo "================================================"
echo -e "${GREEN}✅ Rebranding Complete!${NC}"
echo "Files processed: $total_files"
echo "Files updated: $total_replacements"
echo ""
echo "Next steps:"
echo "1. Rename CLAUDE.md to AUTHORS.md"
echo "2. Update package.json metadata"
echo "3. Update README.md header"
echo "4. Commit changes"
