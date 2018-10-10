/**
* Trellinator makes use of Exceptions to easily tell when 
* a function is not interested in a Notification that has
* been received.
* 
* In general the {@link Notification} methods for fetching
* an entity that was part of this notification, will throw
* an InvalidActionException.
* 
* When something in the {@link module:TrelloEntities}
* module or using {@link IterableCollection} tries to
* access non-existent data or members, they will throw 
* an InvalidDataException.
* 
* As such, these two kinds of exceptions are considered
* "non-fatal".
* 
* Trellinator wraps all function executions in a try/catch
* block and, in the event one of these exceptions is thrown,
* will log the message in the Info Log but will not attempt
* to re-execute the function.
*
* If, however an exception that is not one of these is 
* thrown, the function will be pushed to the Execution Queue
* and Trellinator will attempt to execute it again in 1 minute,
* until it is successful. This means you can always see failed
* functions and their parameters clearly in the Info Log and 
* copy/paste them into a test function to run manually and 
* debug within the Google Apps Script editor.
* 
* Sometimes you might want to catch exceptions yourself, for
* example if you want to test if a label exists on a card,
* you would need to catch an InvalidDataException which would
* indicate that no label exists.
*
* In order to catch only the type of exception you're expecting,
* use the {@link module:TrellinatorCore.Notification}.expectException() method.
*
* If you want to emulate the behaviour of Trellinator and write 
* an entry in the log if InvalidDataException or InvalidActinException is
* thrown but re-throw anything else, use the {@link module:TrellinatorCore.Notification}.logException()
* method.
* @example
* try
* {
*     new Notification(posted).card().label("Something");
* }
*
* catch(e)
* {
*     //Don't rethrow if either no label, or no card as part of this
*     //notification
*     Notification.logException("Something label not present: ",e)
* }
* @example
* try
* {
*     new Notification(posted).card().label("Something");
* }
* 
* catch(e)
* {
*     //Rethrow the exception if it was anything other than
*     //an InvalidActionException
*     Notification.expectException(InvalidActionException,e);
* }
*
* @module Exceptions
*/

/**
* @class InvalidDataException
* @memberof module:Exceptions
* @constructor
* @param msg {string} The exception message
* @classdesc Thrown by {@link module:TrelloEntities}
* and the {@link module:TrellinatorCore.IterableCollection} lass
* when the requested data does not exist
*/
var InvalidDataException = function(msg)
{
  this.msg = msg+"\n\nSTACK: "+Trellinator.getStack();
    
  /**
  * Return a string representation of this message
  * which will include the full stack
  * @memberof module:Exceptions.InvalidDataException
  */
  this.toString = function()
  {
    return this.msg;
  }
}

/**
* @class InvalidActionException
* @memberof module:Exceptions
* @constructor
* @param msg {string} the exception message
* @classdesc thrown by the {@link module:TrellinatorCore.Notification}
* class when attempting to fetch an entity related to a 
* notification doesn't exist, such as card(), archivedCard(),
* movedCard() etc.
*/
var InvalidActionException = function(msg)
{
  this.msg = msg+"\n\nSTACK: "+Trellinator.getStack();
  
  /**
  * Return a string representation of this message
  * which will include the full stack
  * @memberof module:Exceptions.InvalidDataException
  */
  this.toString = function()
  {
    return this.msg;
  }
}

/**
* @class InvalidRequestException
* @memberof module:Exceptions
* @constructor
* @param msg {string} the exception message
* @classdesc thrown by the {@link module:TrellinatorCore.HttpApi}
* class when an error parsing JSON output occurs
*/
var InvalidRequestException = function(msg)
{
  this.msg = msg+"\n\nSTACK: "+Trellinator.getStack();
  
  /**
  * Return a string representation of this message
  * which will include the full stack
  * @memberof module:Exceptions.InvalidDataException
  */
  this.toString = function()
  {
    return this.msg;
  }
}
