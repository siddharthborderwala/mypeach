#!/bin/bash

msg="Are you sure you want to open the production db studio? (y/N)"

cli-confirm "$msg" && dotenv -e .env.production.local -- prisma studio
