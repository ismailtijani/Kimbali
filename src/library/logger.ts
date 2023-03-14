import chalk from "chalk";

export default class Logger {
  public static info(args: any): void {
    console.log(
      chalk.blue(`[${new Date().toLocaleString()}] [INFO]: `),
      typeof args === "string" ? chalk.blueBright(args) : args
    );
  }

  public static warn(args: any): void {
    console.log(
      chalk.yellow(`[${new Date().toLocaleString()}] [INFO]: `),
      typeof args === "string" ? chalk.yellowBright(args) : args
    );
  }

  public static error(args: any): void {
    console.log(
      chalk.red(`[${new Date().toLocaleString()}] [INFO]: `),
      typeof args === "string" ? chalk.red(args) : args
    );
  }
}
