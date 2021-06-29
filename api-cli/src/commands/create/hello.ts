import Command from '@oclif/command';
import { start } from '../../utils/index'

export default class Hello extends Command {
   async run(){
       start()
   }
}