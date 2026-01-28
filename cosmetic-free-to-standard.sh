#!/bin/bash

# ============================================================================
# ClientDining: Cosmetic UI Update - "Free" → "Standard"
# ============================================================================
# This updates DISPLAY TEXT only, database stays as 'free'
# Safe, cosmetic-only changes
# ============================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Updating UI text: Free → Standard (cosmetic only)${NC}"
echo ""

# Create backup
BACKUP_DIR="backup-cosmetic-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# List of files to update
FILES=(
  "app/(diner)/about/page.tsx"
  "app/(diner)/faq/page.tsx"
  "app/(diner)/terms/page.tsx"
  "app/(diner)/search/page.tsx"
  "app/(admin)/admin/users/page.tsx"
  "app/(admin)/admin/slots/page.tsx"
  "app/api/bookings/route.ts"
)

echo -e "${YELLOW}Backing up files...${NC}"
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    cp "$file" "$BACKUP_DIR/$(basename $file)"
    echo "  ✓ Backed up $file"
  fi
done

echo ""
echo -e "${YELLOW}Updating UI text...${NC}"

# Function to update a file
update_file() {
  local file=$1
  if [ ! -f "$file" ]; then
    echo "  ⚠ Skipping $file (not found)"
    return
  fi
  
  # Use sed to replace UI text (not code values)
  sed -i.bak \
    -e 's/Free tier/Standard tier/g' \
    -e 's/Free members/Standard members/g' \
    -e 's/Free users/Standard users/g' \
    -e 's/Free Membership/Standard Membership/g' \
    -e 's/>Free</>Standard</g' \
    -e 's/downgrade to Free/downgrade to Standard/g' \
    -e 's/reverts to Free/reverts to Standard/g' \
    -e 's/All Free tier benefits/All Standard tier benefits/g' \
    -e 's/"Free"/"Standard"/g' \
    "$file"
  
  rm -f "${file}.bak"
  echo "  ✓ Updated $file"
}

# Update each file
for file in "${FILES[@]}"; do
  update_file "$file"
done

# Special case: Update admin dropdowns (keep value="free" but change display text)
if [ -f "app/(admin)/admin/users/page.tsx" ]; then
  sed -i.bak 's/<option value="free">Free<\/option>/<option value="free">Standard<\/option>/g' "app/(admin)/admin/users/page.tsx"
  rm -f "app/(admin)/admin/users/page.tsx.bak"
  echo "  ✓ Updated admin users dropdown"
fi

if [ -f "app/(admin)/admin/slots/page.tsx" ]; then
  sed -i.bak 's/<option value="free">Free<\/option>/<option value="free">Standard<\/option>/g' "app/(admin)/admin/slots/page.tsx"
  rm -f "app/(admin)/admin/slots/page.tsx.bak"
  echo "  ✓ Updated admin slots dropdown"
fi

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Cosmetic update complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}What changed:${NC}"
echo "  • UI text: 'Free' → 'Standard'"
echo "  • Database values: Still 'free' (unchanged)"
echo "  • Code logic: Unchanged"
echo ""
echo -e "${YELLOW}Backup location: $BACKUP_DIR${NC}"
echo ""
echo -e "${YELLOW}Next: npm run build${NC}"
echo ""
