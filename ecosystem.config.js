module.exports = {
  apps: [
    {
      name: "catchbuddy",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      instances: "max", // EC2 ke available CPU cores use karega
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};