declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production'
      DISCORD_TOKEN?: string
      MONGODB_URI?: string
      HEROKU_OAUTH?: string
    }
  }
}

export {};