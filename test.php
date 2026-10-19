<?php print_r(DB::select("SELECT column_name, column_default FROM information_schema.columns WHERE table_name = 'sites'"));
