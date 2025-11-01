#!/usr/bin/env bash
set -euo pipefail

say() { printf "\n===== %s =====\n" "$1"; }

say "ENV"
command -v node >/dev/null && node -v || echo "node: not found"
for pm in pnpm yarn npm; do command -v $pm >/dev/null && ($pm -v || true); done
[ -f .nvmrc ] && { echo ".nvmrc:"; cat .nvmrc; }

say "GIT"
git rev-parse --is-inside-work-tree >/dev/null 2>&1 && {
  echo "remote(s):"; git remote -v | awk '{print $1,$2}' | sort -u
  echo "branch: $(git rev-parse --abbrev-ref HEAD)"
  echo "commit: $(git rev-parse --short HEAD)"
  echo "status:"; git status -sb
} || echo "not a git repo"

say "TOP-LEVEL FILES"
ls -a1 | sed 's/^/ - /' | head -n 200

say "APP ROUTER STRUCTURE (depth 2)"
find app -maxdepth 2 -type d 2>/dev/null | sed 's/^/ - /' | sort || true

say "KEY CONFIG FILES"
for f in package.json turbo.json next.config.* tsconfig.json contentlayer.config.* wrangler.* vercel.* netlify.* \
         tailwind.config.* postcss.config.* .eslintrc.* .prettierrc.* .github/workflows; do
  [ -e "$f" ] && echo " - $f"
done

say "PACKAGE.JSON EXCERPT"
[ -f package.json ] && node -e '
const fs=require("fs");
const p=JSON.parse(fs.readFileSync("package.json","utf8"));
const pick=(o,k)=>o&&o[k]?o[k]:undefined;
console.log({name:p.name, scripts:Object.keys(p.scripts||{}), deps:Object.keys(p.dependencies||{}), devDeps:Object.keys(p.devDependencies||{})});
' || true

say "CHECK: Next.js / Contentlayer / shadcn / MDX / Plausible"
grep -R --line-number --color=never -E "next/font|next/navigation|contentlayer|@contentlayer|shadcn|/ui/|MDXProvider|next-mdx|plausible|Plausible" -n . || true

say "CHECK: Components we discussed"
grep -R --line-number --color=never -E "TwoLaneProcess|CompareSlider|ReviewQueue|validate-citations|Gate [ABCD]|review_status|ai_generated" -n . || true

say "CHECK: CI WORKFLOWS"
[ -d .github/workflows ] && ls -1 .github/workflows | sed 's/^/ - /' || echo "no workflows"

say "CHECK: Cloudflare / Turnstile / Analytics"
grep -R --line-number --color=never -E "Cloudflare|wrangler|Turnstile|@cloudflare|window\._paq|gtag|plausible" -n . || true

say "CHECK: Routes that should exist"
for p in app/how-it-works app/solutions app/admin app/insights; do
  [ -d "$p" ] && echo " - present: $p" || echo " - missing: $p"
done

say "MDX CONTENT INVENTORY"
find content -type f -name "*.mdx" 2>/dev/null | wc -l | xargs echo "mdx files:"
find content -type f -name "*.mdx" 2>/dev/null | sed 's/^/ - /' || true

say "FRONT-MATTER FIELDS CHECK (sample 5 mdx)"
i=0
find content -type f -name "*.mdx" 2>/dev/null | while read -r f; do
  echo "--- $f ---"
  sed -n '1,80p' "$f" | sed -n '1,50p'
  i=$((i+1)); [ $i -ge 5 ] && break
done

say "TYPECHECK / LINT (dry info)"
[ -f tsconfig.json ] && echo "tsconfig present"
[ -f .eslintrc.js ] || [ -f .eslintrc.cjs ] || [ -f .eslintrc.json ] && echo "eslint present" || true

say "DONE"
