type Command = {
  do: () => void;
  undo: () => void;
};

const undoStack: Command[] = [];
const redoStack: Command[] = [];

export function executeCommand(command: Command) {
  command.do();
  undoStack.push(command);
  redoStack.length = 0;
}

export function undoCommand() {
  const command = undoStack.pop();
  if (!command) {
    return;
  }

  command.undo();
  redoStack.push(command);
}

export function redoCommand() {
  const command = redoStack.pop();
  if (!command) {
    return;
  }

  command.do();
  undoStack.push(command);
}
