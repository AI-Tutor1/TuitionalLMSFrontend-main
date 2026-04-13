#!/bin/bash
# setup.sh — One-command setup for the agent-assisted bug remediation system
# Run from the TuitionalLMSFrontend-main root directory
# Usage: chmod +x .agent-setup/setup.sh && ./.agent-setup/setup.sh

set -e

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Tuitional LMS — Agent Bug Remediation Setup            ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# ─── Verify we're in the right directory ─────────────────────
if [ ! -f "package.json" ]; then
    echo "❌ ERROR: package.json not found. Run this from the project root."
    exit 1
fi

PROJECT_NAME=$(node -e "console.log(require('./package.json').name)" 2>/dev/null || echo "unknown")
if [ "$PROJECT_NAME" != "tuitionalcms" ]; then
    echo "⚠️  WARNING: Expected project 'tuitionalcms', found '$PROJECT_NAME'"
    echo "   Continuing anyway..."
fi

echo "📁 Project root: $(pwd)"
echo ""

# ─── Verify required directories exist ───────────────────────
echo "Checking agent system files..."

REQUIRED_FILES=(
    "CLAUDE.md"
    ".agent-docs/AGENT_TASKS.md"
    ".agent-docs/DESIGN.md"
    ".agent-docs/EXECUTION_PROMPTS.md"
    ".agent-context/project.toml"
    ".agent-context/rules.toml"
    ".agent-context/registry/index.json"
    ".agent-context/graph/god-nodes.json"
    ".agent-context/contracts/api-contracts.toml"
)

MISSING=0
for f in "${REQUIRED_FILES[@]}"; do
    if [ -f "$f" ]; then
        echo "  ✅ $f"
    else
        echo "  ❌ MISSING: $f"
        MISSING=$((MISSING + 1))
    fi
done

if [ $MISSING -gt 0 ]; then
    echo ""
    echo "❌ $MISSING required files missing."
    echo "   Extract tuitional-lms-agent-package.zip into the project root first."
    exit 1
fi

echo ""
echo "All agent system files present."
echo ""

# ─── Setup .env.local from .env.example ──────────────────────
if [ ! -f ".env.local" ]; then
    if [ -f ".env.example" ]; then
        echo "📝 Creating .env.local from .env.example..."
        cp .env.example .env.local
        echo "  ⚠️  IMPORTANT: Fill in actual values in .env.local"
        echo "  Current values are from the hardcoded config — verify them."
    else
        echo "⚠️  No .env.example found. Skipping .env.local creation."
    fi
else
    echo "✅ .env.local already exists"
fi

echo ""

# ─── Ensure .env.local is gitignored ─────────────────────────
if [ -f ".gitignore" ]; then
    if ! grep -q ".env.local" .gitignore; then
        echo "📝 Adding .env.local to .gitignore..."
        echo "" >> .gitignore
        echo "# Environment files" >> .gitignore
        echo ".env.local" >> .gitignore
        echo ".env*.local" >> .gitignore
    else
        echo "✅ .env.local already in .gitignore"
    fi
fi

echo ""

# ─── Install dependencies if needed ─────────────────────────
if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm dependencies..."
    npm install
else
    echo "✅ node_modules exists"
fi

echo ""

# ─── Verify TypeScript compiles ──────────────────────────────
echo "🔍 Running type check..."
if npx tsc --noEmit 2>/dev/null; then
    echo "  ✅ TypeScript compiles"
else
    echo "  ⚠️  TypeScript has errors (expected — bugs exist)"
fi

echo ""

# ─── Verify git status ──────────────────────────────────────
echo "🔍 Git status:"
BRANCH=$(git branch --show-current 2>/dev/null || echo "not a git repo")
echo "  Branch: $BRANCH"
CHANGES=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
echo "  Uncommitted changes: $CHANGES"

echo ""

# ─── Print current codebase stats ────────────────────────────
echo "📊 Codebase stats:"
echo "  Total files: $(find src -type f 2>/dev/null | wc -l | tr -d ' ')"
echo "  TSX files: $(find src -type f -name '*.tsx' 2>/dev/null | wc -l | tr -d ' ')"
echo "  TS files: $(find src -type f -name '*.ts' 2>/dev/null | wc -l | tr -d ' ')"
echo "  JSX files: $(find src -type f -name '*.jsx' 2>/dev/null | wc -l | tr -d ' ') (should be 0 after fixes)"
echo "  CSS files: $(find src -type f -name '*.css' 2>/dev/null | wc -l | tr -d ' ')"
echo "  'any' types: $(grep -rn ': any' src/ --include='*.ts' --include='*.tsx' 2>/dev/null | wc -l | tr -d ' ')"
echo "  console.log: $(grep -rn 'console.log' src/ --include='*.ts' --include='*.tsx' 2>/dev/null | wc -l | tr -d ' ')"

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Setup complete!                                        ║"
echo "║                                                         ║"
echo "║  Next steps:                                            ║"
echo "║  1. Open Claude Code in this directory                  ║"
echo "║  2. Open .agent-docs/EXECUTION_PROMPTS.md               ║"
echo "║  3. Copy-paste Prompt 1 into Claude Code                ║"
echo "║  4. Review changes after each tier                      ║"
echo "║  5. Copy-paste Prompt 4 for final audit                 ║"
echo "╚══════════════════════════════════════════════════════════╝"
