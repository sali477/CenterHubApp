import { execSync } from 'child_process';

const port = process.argv[2] || process.env.PORT || 5000;

const killOnWindows = () => {
  try {
    const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
    const pids = new Set();

    output.split('\n').forEach((line) => {
      if (!line.includes('LISTENING')) return;
      const pid = line.trim().split(/\s+/).pop();
      if (pid && pid !== '0') pids.add(pid);
    });

    if (pids.size === 0) {
      console.log(`Port ${port} is already free.`);
      return;
    }

    pids.forEach((pid) => {
      execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
      console.log(`Freed port ${port} — stopped process ${pid}`);
    });
  } catch {
    console.log(`Port ${port} is already free.`);
  }
};

const killOnUnix = () => {
  try {
    const pid = execSync(`lsof -ti :${port}`, { encoding: 'utf8' }).trim();
    if (pid) {
      execSync(`kill -9 ${pid}`);
      console.log(`Freed port ${port} — stopped process ${pid}`);
    }
  } catch {
    console.log(`Port ${port} is already free.`);
  }
};

if (process.platform === 'win32') {
  killOnWindows();
} else {
  killOnUnix();
}
