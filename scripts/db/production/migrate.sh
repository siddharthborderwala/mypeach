#!/bin/bash

msg="Are you sure you want to deploy the migrations to production db? (y/N)"

cli-confirm "$msg" && dotenv -e .env.production.local -- prisma migrate deploy
