#!/usr/bin/env bash
curl -s -X POST \
  https://niqxxmrjqrglpmofsmwi.supabase.co/functions/v1/daily-call \
  -H "Authorization: Bearer sb_publishable_RUrlmtPcI5D7r12SnuLe4w_rqPoyZOH" \
  -H "Content-Type: application/json" \
  -d '{"orgId":"00000000-0000-0000-0000-000000000001","testPhone":"+17202976965","summary":"2 pickups available, pantry at 65 percent capacity."}' \
  | python3 -m json.tool
