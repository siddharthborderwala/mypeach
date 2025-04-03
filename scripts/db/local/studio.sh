#!/bin/bash

dotenv -e .env.development.local -- prisma studio
