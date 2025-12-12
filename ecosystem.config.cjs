module.exports = {
    apps: [{
        name: 'jarvis-bridge',
        script: 'dist/index.js',
        exec_mode: 'fork',  // Modo fork para uma única instância
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '512M',
        env: {
            NODE_ENV: 'production'
        },
        error_file: '/var/log/jarvis-bridge/error.log',
        out_file: '/var/log/jarvis-bridge/out.log',
        log_file: '/var/log/jarvis-bridge/combined.log',
        time: true,
        merge_logs: true,
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }]
};
