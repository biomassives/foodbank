#!/usr/bin/perl
use strict;
use warnings;
use utf8;

# Path corrected based on your error log
my $file = 'src/pages/OnboardPage.vue'; 

if (!-e $file) {
    die "Error: '$file' not found. Run this from the /home/solstice/FoodBank/ directory.\n";
}

# Read file
open(my $fh, '<:encoding(UTF-8)', $file) or die $!;
my $content = do { local $/; <$fh> };
close($fh);

# --- 1. THEME LOGIC (Injecting into script setup) ---
my $theme_logic = <<'EOF';
const $q = useQuasar();
const activeTheme = computed(() => $q.dark.isActive ? 'neon' : 'default');
const tp = computed(() => {
  const themes = {
    default: {
      sunFill: 'rgba(255,255,255,0.1)', sunStroke: 'rgba(255,255,255,0.18)',
      horizon: 'rgba(255,255,255,0.1)', building: 'rgba(0,0,0,0.2)',
      window: 'rgba(255,255,255,0.08)', accent: 'none'
    },
    neon: {
      sunFill: '#ff00ff', sunStroke: '#00ffff',
      horizon: '#00ffff', building: '#1a1a2e',
      window: '#00ffff', accent: '#ff00ff'
    }
  };
  return themes[activeTheme.value] || themes.default;
});
EOF

# Inject if not present (escaping braces for the match)
if ($content !~ /const tp = computed/) {
    $content =~ s/(const \{ t \} = useI18n\(\);)/$1\n\n$theme_logic/g;
}

# --- 2. THE SVG REPLACEMENTS ---
# Note the added closing </svg> at the end to ensure template integrity.

# Card 1: Sunset
my $sunset_svg = <<'EOF';
          <svg class="hero-art" viewBox="0 0 460 180" preserveAspectRatio="none">
            <defs>
              <filter id="glow"><feGaussianBlur stdDeviation="2.5" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>
            <circle cx="230" cy="52" r="40" :fill="tp.sunFill" :stroke="tp.sunStroke" stroke-width="2" :filter="activeTheme === 'neon' ? 'url(#glow)' : ''" />
            <line x1="0" y1="100" x2="460" y2="100" :stroke="tp.horizon" stroke-width="1" />
            <rect x="10" y="112" width="55" height="68" :fill="tp.building" :stroke="tp.accent" />
            <rect x="192" y="104" width="48" height="76" :fill="tp.building" :stroke="tp.accent" />
            <rect x="20" y="125" width="4" height="4" :fill="tp.window" :filter="activeTheme === 'neon' ? 'url(#glow)' : ''" />
          </svg>
EOF

# Regex: Matches from the comment until the first </svg> it finds
$content =~ s/.*?<\/svg>/$sunset_svg/s;

# Card 2: Forest
my $forest_svg = <<'EOF';
          <svg class="hero-art" viewBox="0 0 460 180" preserveAspectRatio="none">
            <rect x="0" y="165" width="460" height="15" :fill="tp.building" />
            <polygon points="0,180 38,72 76,180" fill="none" :stroke="tp.sunStroke" stroke-width="1.5" />
            <polygon points="85,180 128,45 171,180" fill="none" :stroke="tp.sunStroke" stroke-width="1.5" />
            <circle v-if="activeTheme === 'neon'" cx="95" cy="35" r="1.5" fill="#00ffff" />
          </svg>
EOF

$content =~ s/.*?<\/svg>/$forest_svg/s;

# Save
open(my $out, '>:encoding(UTF-8)', $file) or die $!;
print $out $content;
close($out);

print "Successfully patched $file. Vite should now hot-reload without errors.\n";
