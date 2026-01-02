#!/bin/bash
# Corpus Ingest Script for Scanminers Brain v0
# Uploads documents to R2 and inserts Source rows in D1
# Date: 2026-01-02

set -e

CORPUS_DIR="/home/mahmood-asadi/Downloads/scanminer articles"
BUCKET="scanminers-evidence"
MANIFEST="corpus/manifest.json"

echo "=== Scanminers Brain Corpus Ingest ==="
echo "Date: $(date -Iseconds)"
echo ""

# Read manifest and upload each file
echo "Phase 1: Uploading documents to R2..."
echo ""

# Playbook
echo "[1/13] Uploading SCANMINERS INTERNAL PLAYBOOK..."
cat "$CORPUS_DIR/SCANMINERS INTERNAL PLAYBOOK.docx" | \
  npx wrangler r2 object put "$BUCKET/sources/playbook-001/9cee81ea4cf31102167e5c79e7082e2d50ee90bed5bc7eb1c967d042744998fe.docx" --pipe

# Article 1
echo "[2/13] Uploading Article 1: From Region to Drill Target..."
cat "$CORPUS_DIR/From Region to Drill Target (Article 1).docx" | \
  npx wrangler r2 object put "$BUCKET/sources/article-001/f228da9bf5850396bd8b4e90aa6f0b421c196517130d2eedf07355104da4a23b.docx" --pipe

# Article 2
echo "[3/13] Uploading Article 2: Data Hierarchy for Critical Minerals..."
cat "$CORPUS_DIR/Data Hierarchy for Critical Minerals (Article 2).docx" | \
  npx wrangler r2 object put "$BUCKET/sources/article-002/27f7026f7fa15489be34eeae51ee5697b871e695e6f35babbc4e0efd378d273f.docx" --pipe

# Article 3
echo "[4/13] Uploading Article 3: Our Remote Sensing & GeoAI Toolbox..."
cat "$CORPUS_DIR/Our Remote Sensing & GeoAI Toolbox for Critical Minerals (Article 3).docx" | \
  npx wrangler r2 object put "$BUCKET/sources/article-003/4526b383c2c4fccbc27dca2eb5cdb684abb951eae87357becd30cdeeac953f61.docx" --pipe

# Article 4
echo "[5/13] Uploading Article 4: Early-Stage Screening for LCT Pegmatites..."
cat "$CORPUS_DIR/Early-Stage Screening for LCT Pegmatites Under Cover (Article 4).docx" | \
  npx wrangler r2 object put "$BUCKET/sources/article-004/844532e04c818be9b7bf54cc9c0fd9533a5945304552cfc20545b7aa9d7a0dae.docx" --pipe

# Article 5
echo "[6/13] Uploading Article 5: Alteration Mapping for Porphyry Copper Systems..."
cat "$CORPUS_DIR/Alteration Mapping for Porphyry Copper Systems (Article 5).docx" | \
  npx wrangler r2 object put "$BUCKET/sources/article-005/d4fcaad2e4d0b5674ca2d7f07c58354bcc89db85d70b08ff7f28d0e66bd72250.docx" --pipe

# Article 6
echo "[7/13] Uploading Article 6: Structural Mapping and Lineament Analysis..."
cat "$CORPUS_DIR/Structural Mapping and Lineament Analysis for District-Scale Targeting (Article 6).docx" | \
  npx wrangler r2 object put "$BUCKET/sources/article-006/ee1b33eda8500e0f1408fe5238a414c3ab73e9aab0e96d81db8a3a142a85090d.docx" --pipe

# Article 7
echo "[8/13] Uploading Article 7: Understanding Cover and Surface Conditions..."
cat "$CORPUS_DIR/Understanding Cover and Surface Conditions Before Spending Money (Article 7).docx" | \
  npx wrangler r2 object put "$BUCKET/sources/article-007/6f7d3685a1c12ffa5461d1ba9d88806cdc80533a52610b4c885b054f77c247c8.docx" --pipe

# Article 8
echo "[9/13] Uploading Article 8: From Pixels to Prospects..."
cat "$CORPUS_DIR/From Pixels to Prospects Combining Layers into a Ranked Target List (Article 8).docx" | \
  npx wrangler r2 object put "$BUCKET/sources/article-008/572d5da7621099463fd0b956f8a48de44cc73e5e7974916ebd73eb3b9f369146.docx" --pipe

# Article 9
echo "[10/13] Uploading Article 9: Common Failure Modes..."
cat "$CORPUS_DIR/Common Failure Modes in Remote-Sensing-Driven Targeting (Article 9).docx" | \
  npx wrangler r2 object put "$BUCKET/sources/article-009/382c21950fffb05bc772ba2e6ea6ece9bf846cced3480e2b9f65b5d7ef5db2e4.docx" --pipe

# Article 10
echo "[11/13] Uploading Article 10: How We Validate Remote-Sensing Leads..."
cat "$CORPUS_DIR/How We Validate Remote-Sensing Leads Before Recommending Serious Work (Artilce 10).docx" | \
  npx wrangler r2 object put "$BUCKET/sources/article-010/16ac881e5228be738b71eeede5c87cb2c8e67cecc6951b2dad13126d9728d863.docx" --pipe

# Case Study 1
echo "[12/13] Uploading Case Study 1..."
cat "$CORPUS_DIR/Case Study 1.docx" | \
  npx wrangler r2 object put "$BUCKET/sources/casestudy-001/3a09600dd31105db57c23daee60d87079adbe103a8c3d4a9322585e0afa116ab.docx" --pipe

# Case Study 2
echo "[13/13] Uploading Case Study 2..."
cat "$CORPUS_DIR/Case Study 2.docx" | \
  npx wrangler r2 object put "$BUCKET/sources/casestudy-002/1768a394dc513f789e3398a79d282436945dd56031cd6996571718dea219a977.docx" --pipe

echo ""
echo "Phase 1 complete: 13 documents uploaded to R2"
echo ""

echo "=== R2 Upload Complete ==="
