#!/usr/bin/env bash

# Define project directories
project_root="./"
src_directory="./src"

# Generate output
output=$(
    echo "# Angular Project Structure Overview"
    echo "This script provides a quick overview of the Angular project's structure and source files."
    echo "- Use angular cli if posible, this will mantain the file convention"
    echo "- Make sure to use npx ng when providing code samples"
    echo "- Use standalone components to avoid the need for NgModule"

    echo -e "\n## Level 1 Tree of Project Root"
    tree -L 1 "$project_root"

    echo -e "\n## Tree of /src Directory"
    if [ -d "$src_directory" ]; then
        tree "$src_directory"
    else
        echo "The /src directory does not exist."
    fi

    echo -e "\n## README Content"
    if [ -f "./README.md" ]; then
        echo -e "\n=== ./README.md ==="
        cat "./README.md"
    else
        echo "No README.md file found."
    fi
)

# Print output
echo "$output"

# Copy to clipboard
echo "$output" | xclip -selection clipboard
if [ $? -eq 0 ]; then
    echo -e "\n✓ Successfully copied to clipboard!"
else
    echo -e "\n✗ Failed to copy to clipboard"
fi

