#!/bin/bash

# ============================================================================
# ClientDining: Revert "Standard" back to "Free"
# ============================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Reverting UI text: Standard → Free${NC}"
echo ""

# List of files to revert
FILES=(
  "app/(diner)/about/page.tsx"
  "app/(diner)/faq/page.tsx"
  "app/(diner)/terms/page.tsx"
  "app/(diner)/search/page.tsx"
  "app/(admin)/admin/users/page.tsx"
  "app/(admin)/admin/slots/page.tsx"
  "app/api/bookings/route.ts"
  "lib/booking-rules.ts"
)

echo -e "${YELLOW}Reverting files...${NC}"

# Function to revert a file
revert_file() {
  local file=$1
  if [ ! -f "$file" ]; then
    echo "  ⚠ Skipping $file (not found)"
    return
  fi
  
  # Revert all Standard references back to Free
  sed -i.bak \
    -e 's/Standard tier/Free tier/g' \
    -e 's/Standard members/Free members/g' \
    -e 's/Standard users/Free users/g' \
    -e 's/Standard Membership/Free Membership/g' \
    -e 's/>Standard</>Free</g' \
    -e 's/downgrade to Standard/downgrade to Free/g' \
    -e 's/reverts to Standard/reverts to Free/g' \
    -e 's/All Standard tier benefits/All Free tier benefits/g' \
    -e 's/"Standard"/"Free"/g' \
    -e "s/'Standard'/'Free'/g" \
    "$file"
  
  rm -f "${file}.bak"
  echo "  ✓ Reverted $file"
}

# Revert each file
for file in "${FILES[@]}"; do
  revert_file "$file"
done

# Special case: Revert admin dropdowns
if [ -f "app/(admin)/admin/users/page.tsx" ]; then
  sed -i.bak 's/<option value="free">Standard<\/option>/<option value="free">Free<\/option>/g' "app/(admin)/admin/users/page.tsx"
  rm -f "app/(admin)/admin/users/page.tsx.bak"
  echo "  ✓ Reverted admin users dropdown"
fi

if [ -f "app/(admin)/admin/slots/page.tsx" ]; then
  sed -i.bak 's/<option value="free">Standard<\/option>/<option value="free">Free<\/option>/g' "app/(admin)/admin/slots/page.tsx"
  rm -f "app/(admin)/admin/slots/page.tsx.bak"
  echo "  ✓ Reverted admin slots dropdown"
fi

# Revert search page filter options
if [ -f "app/(diner)/search/page.tsx" ]; then
  sed -i.bak 's/<option value="standard">Standard<\/option>/<option value="free">Free<\/option>/g' "app/(diner)/search/page.tsx"
  rm -f "app/(diner)/search/page.tsx.bak"
  echo "  ✓ Reverted search page tier filter"
fi

# Revert booking-rules.ts getSlotAccessLabel function
if [ -f "lib/booking-rules.ts" ]; then
  sed -i.bak "s/: 'Standard'/: 'Free'/g" "lib/booking-rules.ts"
  rm -f "lib/booking-rules.ts.bak"
  echo "  ✓ Reverted booking rules label"
fi

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Revert complete! Everything back to 'Free'${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Next: npm run build${NC}"
echo ""
