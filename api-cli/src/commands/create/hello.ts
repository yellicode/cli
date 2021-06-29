import Command from '@oclif/command';
import { start } from '../../../../src/index';

export default class Hello extends Command {
   async run(){
       start()
   }
}