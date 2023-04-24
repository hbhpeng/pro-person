import * as fs from 'fs';

const dirPath = './data';
const filePath = './data/passwd.txt';

if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath);
}

fs.access(filePath, fs.constants.F_OK, (err) => {
  if (!err) {
    // console.log(`${filePath} already exists!`);
    return;
  }

  fs.writeFile(filePath, '', (err) => {
    if (err) throw err;
    // console.log(`${filePath} has been created successfully!`);
  });
});


let passwordCache: Set<string> = new Set();

// 加载密码文件
function loadPasswordFile() {
  const data = fs.readFileSync(filePath, 'utf-8');
  const lines = data.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const password = lines[i].trim();
    if (password) {
      passwordCache.add(password);
    }
  }
}

// 添加密码到文件
export function addPasswordToFile(password: string) {
	global.console.log(password)
  fs.appendFileSync(filePath, password + '\n');
  passwordCache.add(password);
}

// 判断密码是否在文件内存在
export function isPasswordInFile(password: string): boolean {
  if (passwordCache.size === 0) {
    loadPasswordFile();
  }
  return passwordCache.has(password);
}

// 从文件中删除密码
export function removePasswordFromFile(password: string) {
  // 从缓存中删除密码
  passwordCache.delete(password);

  // 从文件中删除密码
  const data = fs.readFileSync(filePath, 'utf-8');
  const lines = data.split('\n');
  const newData = lines.filter((line) => line.trim() !== password).join('\n');
  fs.writeFileSync(filePath, newData, 'utf-8');
}


