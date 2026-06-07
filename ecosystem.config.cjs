module.exports = {
  apps: [
    {
      name: "tronx-ai-dashboard",
      script: "node_modules/next/dist/bin/next",
      args: "start -H 127.0.0.1 -p 3000",
      cwd: __dirname,
      exec_mode: "fork",
      instances: 1,
      max_memory_restart: "700M",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
    },
  ],
};
