<?php try { $pdo = new PDO("mysql:host=mysql;dbname=ai_stocks", "root", "password"); echo "Database connection successful"; } catch (Exception $e) { echo "Error: " . $e->getMessage(); } ?>
