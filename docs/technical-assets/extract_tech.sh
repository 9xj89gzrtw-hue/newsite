#!/bin/bash

# Technical Assets Extraction Script
DIR="/home/z/my-project/docs/technical-assets"

# Site mapping
declare -A SITES=(
  ["site_01"]="concordecatering.ca"
  ["site_02"]="myradish.com"
  ["site_03"]="ridgewells.com"
  ["site_04"]="sopranoscatering.com"
  ["site_05"]="concept-catering.de"
  ["site_06"]="talkofthetownatlanta.com"
  ["site_07"]="queenofheartscatering.com"
  ["site_08"]="chicchefcatering.com"
  ["site_09"]="relishcaterers.com"
  ["site_10"]="sterlingcateringmn.com"
  ["site_11"]="tallguyandagrill.com"
  ["site_12"]="ggcatering.com"
  ["site_14"]="mculinary.com"
  ["site_15"]="saltblockhospitality.com"
  ["site_16"]="thejdkgroup.com"
  ["site_17"]="bywordofmouth.co.uk"
  ["site_18"]="creativeedgeparties.com"
  ["site_19"]="cutandtastelv.com"
  ["site_20"]="elegantaffairscaterers.com"
  ["site_21"]="gammacatering.com/en/"
  ["site_22"]="wolfgangpuckcatering.com"
)

echo "{"
echo '  "analysis_date": "'$(date -Iseconds)'",'
echo '  "sites": {'

first_site=true
for site_file in "${!SITES[@]}"; do
  html_file="$DIR/${site_file}.html"
  site_url="${SITES[$site_file]}"
  
  if [ ! -f "$html_file" ]; then
    continue
  fi
  
  if [ "$first_site" = true ]; then
    first_site=false
  else
    echo ","
  fi
  
  echo "    \"$site_url\": {"
  
  # Extract CSS links
  echo "      \"css_files\": ["
  css_links=$(grep -oP 'href="[^"]*\.css[^"]*"' "$html_file" | sed 's/href="//;s/"$//' | head -20 | sort -u)
  first_css=true
  while IFS= read -r css; do
    [ -z "$css" ] && continue
    if [ "$first_css" = true ]; then
      first_css=false
    else
      echo ","
    fi
    echo -n "        \"$css\""
  done <<< "$css_links"
  echo ""
  echo "      ],"
  
  # Extract CSS frameworks detection
  echo "      \"css_frameworks\": {"
  if grep -qi "bootstrap" "$html_file"; then
    bootstrap_ver=$(grep -oiP 'bootstrap[^"'\'']*\.\d+\.\d+' "$html_file" | head -1)
    echo "        \"bootstrap\": \"${bootstrap_ver:-detected}\""
  else
    echo "        \"bootstrap\": null"
  fi
  echo "        ,"
  if grep -qi "tailwindcss\|tailwind" "$html_file"; then
    echo "        \"tailwind\": \"detected\""
  else
    echo "        \"tailwind\": null"
  fi
  echo "        ,"
  if grep -qi "font-awesome\|fontawesome\|fa-" "$html_file"; then
    fa_ver=$(grep -oiP 'font-?awesome[^"'\'']*' "$html_file" | head -1)
    echo "        \"font_awesome\": \"${fa_ver:-detected}\""
  else
    echo "        \"font_awesome\": null"
  fi
  echo "        ,"
  if grep -qi "animate\.css\|animate.min.css" "$html_file"; then
    echo "        \"animate_css\": \"detected\""
  else
    echo "        \"animate_css\": null"
  fi
  echo "        ,"
  if grep -qi "slick\|swiper\|owl\.carousel\|carousel" "$html_file"; then
    carousel=$(grep -oiP '(slick|swiper|owl)[^"'\'']*\.css' "$html_file" | head -1)
    echo "        \"carousel_css\": \"${carousel:-detected}\""
  else
    echo "        \"carousel_css\": null"
  fi
  echo "      },"
  
  # Extract fonts (Google Fonts)
  echo "      \"fonts\": {"
  google_fonts=$(grep -oP 'fonts\.googleapis\.com/css\?family=[^"&]+' "$html_file" | sed 's/family=//' | head -5)
  if [ -n "$google_fonts" ]; then
    echo "        \"google_fonts\": ["
    first_font=true
    while IFS= read -r font; do
      [ -z "$font" ] && continue
      font_name=$(echo "$font" | cut -d':' -f1 | sed 's/+/ /g')
      if [ "$first_font" = true ]; then
        first_font=false
      else
        echo ","
      fi
      echo -n "          \"$font_name\""
    done <<< "$google_fonts"
    echo ""
    echo "        ],"
  else
    echo "        \"google_fonts\": [],"
  fi
  
  # Font-family declarations
  font_families=$(grep -oiP 'font-family:\s*[^;]+' "$html_file" | sed 's/font-family:\s*//' | head -10 | sort -u)
  echo "        \"font_family_declarations\": ["
  first_ff=true
  while IFS= read -r ff; do
    [ -z "$ff" ] && continue
    if [ "$first_ff" = true ]; then
      first_ff=false
    else
      echo ","
    fi
    ff_clean=$(echo "$ff" | tr ',' '\n' | head -1 | sed 's/^["'"'"']//;s/["'"'"']$//')
    echo -n "          \"$ff_clean\""
  done <<< "$font_families"
  echo ""
  echo "        ]"
  echo "      },"
  
  # Extract Favicon
  echo "      \"favicon\": {"
  favicon=$(grep -oP '<link[^>]*rel=["'"'"']icon["'"'"'][^>]*>' "$html_file" | head -3)
  favicon_href=$(echo "$favicon" | grep -oP 'href="[^"]+"' | head -1 | sed 's/href="//;s/"$//')
  favicon_type=$(echo "$favicon" | grep -oP 'type="[^"]+"' | head -1 | sed 's/type="//;s/"$//')
  if [ -n "$favicon_href" ]; then
    echo "        \"url\": \"$favicon_href\","
    echo "        \"type\": \"${favicon_type:-unknown}\""
  else
    favicon_alt=$(grep -oP 'favicon\.[a-z]+' "$html_file" | head -1)
    echo "        \"url\": \"${favicon_alt:-not_found}\","
    echo "        \"type\": \"unknown\""
  fi
  echo "      },"
  
  # Touch icons
  echo "      \"touch_icons\": ["
  touch_icons=$(grep -oP '<link[^>]*rel=["'"'"']apple-touch-icon["'"'"'][^>]*href="[^"]+' "$html_file" | sed 's/.*href="//' | head -5)
  first_ti=true
  while IFS= read -r ti; do
    [ -z "$ti" ] && continue
    if [ "$first_ti" = true ]; then
      first_ti=false
    else
      echo ","
    fi
    echo -n "        \"$ti\""
  done <<< "$touch_icons"
  echo ""
  echo "      ],"
  
  # JavaScript files and libraries
  echo "      \"javascript\": {"
  echo "        \"external_scripts\": ["
  js_files=$(grep -oP 'src="[^"]*\.js[^"]*"' "$html_file" | sed 's/src="//;s/"$//' | grep -v '^#' | sort -u | head -30)
  first_js=true
  while IFS= read -r js; do
    [ -z "$js" ] && continue
    if [ "$first_js" = true ]; then
      first_js=false
    else
      echo ","
    fi
    echo -n "          \"$js\""
  done <<< "$js_files"
  echo ""
  echo "        ],"
  
  # Detect JS libraries
  echo "        \"libraries\": {"
  if grep -qi 'jquery' "$html_file"; then
    jq_ver=$(grep -oiP 'jquery[.-]?\d+\.\d+\.\d+|jquery/\d+\.\d+' "$html_file" | head -1)
    echo "          \"jquery\": \"${jq_ver:-detected}\""
  else
    echo "          \"jquery\": null"
  fi
  echo "          ,"
  if grep -qi 'gsap\|TweenMax\|TweenLite\|TimelineMax' "$html_file"; then
    echo "          \"gsap\": \"detected\""
  else
    echo "          \"gsap\": null"
  fi
  echo "          ,"
  if grep -qi 'wow\.js\|wow.min.js' "$html_file"; then
    echo "          \"wow_js\": \"detected\""
  else
    echo "          \"wow_js\": null"
  fi
  echo "          ,"
  if grep -qi 'aos\.js\|aos.min.js' "$html_file"; then
    echo "          \"aos\": \"detected\""
  else
    echo "          \"aos\": null"
  fi
  echo "          ,"
  if grep -qi 'slick\|swiper\|owl\.carousel' "$html_file"; then
    carousel_lib=$(grep -oiP '(slick|swiper|owl)[^"'\'']*\.js' "$html_file" | head -1)
    echo "          \"carousel\": \"${carousel_lib:-detected}\""
  else
    echo "          \"carousel\": null"
  fi
  echo "          ,"
  if grep -qi 'vue\.js\|react\|angular' "$html_file"; then
    framework_lib=$(grep -oiP '(vue|react|angular)[^"'\'']*\.js' "$html_file" | head -1)
    echo "          \"framework\": \"${framework_lib:-detected}\""
  else
    echo "          \"framework\": null"
  fi
  echo "        },"
  
  # Analytics
  echo "        \"analytics\": {"
  if grep -qi 'google-analytics\|gtag\|GA_MEASUREMENT_ID\|googletagmanager' "$html_file"; then
    ga_id=$(grep -oiP 'G-[A-Z0-9]{10}|UA-\d+-\d+' "$html_file" | head -1)
    echo "          \"google_analytics\": \"${ga_id:-detected}\""
  else
    echo "          \"google_analytics\": null"
  fi
  echo "          ,"
  if grep -qi 'facebook.*pixel\|fbq\|fbevents' "$html_file"; then
    fb_pixel=$(grep -oiP '\d{15,}' "$html_file" | head -1)
    echo "          \"facebook_pixel\": \"${fb_pixel:-detected}\""
  else
    echo "          \"facebook_pixel\": null"
  fi
  echo "          ,"
  if grep -qi 'hotjar' "$html_file"; then
    echo "          \"hotjar\": \"detected\""
  else
    echo "          \"hotjar\": null"
  fi
  echo "        },"
  
  # Chat widgets
  echo "        \"chat_widgets\": {"
  if grep -qi 'tidio\|tidiochat' "$html_file"; then
    echo "          \"tidio\": \"detected\""
  else
    echo "          \"tidio\": null"
  fi
  echo "          ,"
  if grep -qi 'intercom' "$html_file"; then
    echo "          \"intercom\": \"detected\""
  else
    echo "          \"intercom\": null"
  fi
  echo "          ,"
  if grep -qi 'crisp\.chat\|crisp' "$html_file"; then
    echo "          \"crisp\": \"detected\""
  else
    echo "          \"crisp\": null"
  fi
  echo "          ,"
  if grep -qi 'zendesk\|zE' "$html_file"; then
    echo "          \"zendesk\": \"detected\""
  else
    echo "          \"zendesk\": null"
  fi
  echo "        }"
  echo "      },"
  
  # CSS Variables (custom properties)
  echo "      \"css_variables_sample\": ["
  css_vars=$(grep -oP '--[a-zA-Z-]+:\s*[^;]+' "$html_file" | head -20)
  first_var=true
  while IFS= read -r var; do
    [ -z "$var" ] && continue
    if [ "$first_var" = true ]; then
      first_var=false
    else
      echo ","
    fi
    echo -n "        \"$var\""
  done <<< "$css_vars"
  echo ""
  echo "      ],"
  
  # Meta tags
  echo "      \"meta\": {"
  viewport=$(grep -oP '<meta[^>]*viewport[^>]*content="[^"]*"' "$html_file" | head -1 | grep -oP 'content="[^"]+"')
  echo "        \"viewport\": ${viewport:-null},"
  description=$(grep -oP '<meta[^>]*description[^>]*content="[^"]*"' "$html_file" | head -1 | grep -oP 'content="[^"]+"')
  echo "        \"description\": ${description:-null},"
  generator=$(grep -oP '<meta[^>]*generator[^>]*content="[^"]*"' "$html_file" | head -1 | grep -oP 'content="[^"]+"')
  echo "        \"generator\": ${generator:-null}"
  echo "      },"
  
  # Platform/CMS Detection
  echo "      \"platform\": {"
  if grep -qi 'squarespace' "$html_file"; then
    echo "        \"cms\": \"Squarespace\","
  elif grep -qi 'wordpress\|wp-content\|wp-json' "$html_file"; then
    echo "        \"cms\": \"WordPress\","
  elif grep -qi 'shopify' "$html_file"; then
    echo "        \"cms\": \"Shopify\","
  elif grep -qi 'wix' "$html_file"; then
    echo "        \"cms\": \"Wix\","
  elif grep -qi 'drupal' "$html_file"; then
    echo "        \"cms\": \"Drupal\","
  else
    echo "        \"cms\": \"unknown\","
  fi
  
  page_size=$(wc -c < "$html_file")
  echo "        \"html_size_bytes\": $page_size"
  echo "      }"
  
  echo "    }"
done

echo ""
echo "  }"
echo "}"
