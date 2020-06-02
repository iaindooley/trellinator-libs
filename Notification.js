/**
* These are the classes that form the basis
* of the Trellinator, concerning the execution
* of functions in response to Notifications
* or as part of Time Triggers or in the 
* Execution Queue
* @module TrellinatorCore
*/
/**
* @class Notification
* @memberof module:TrellinatorCore
* @constructor
* @param notification {Object} an object that has been posted
* to a webhook from the Trello API
* @classdesc The Notification object takes a 
* notification from the Trello API sent to a 
* webhook and makes it easy to determine what 
* type of event took place and to get access to
* the entities that were part of 
* the notification. The notifications passed into
* this constructor are always sent to webhooks registered
* at the board level. There are 4 types of method:
* 
* - methods that return an object that was the source
*   or origination of this notification, throwing an
*   exception if that object is not present which 
*   indicates in turn that type of notification did
*   not occur. The first part of the function name
*   is the verb, with the object coming after,
*   eg. archivedCard or completedChecklistItem.
*
* - methods that return an entity that was part of
*   the notification, such as board(), card() and
*   member(). Given these notifications are always
*   at the board level, there is always a board()
*   and given every notification originates with an
*   action by a member there is always a member()
*   however there is not always a card(), so if
*   for example this notification is a list name
*   being updated the card() method will throw an
*   InvalidActionException
*
* - Finally there are a couple of convenience 
*   functions that are just shorthand for a 
*   few different common scenarios such as
*   actionOnDueDate and replyToMember
*
* - Static methods that are used globally and
*    are simply grouped within this class for
*    logical reasons
* 
* There are some methods that are deprecated or
* used internally by other class methods so you can
* ignore those, they are marked as such in the
* code comments, but aren't included in the API
* documentation.
*
* Even though all methods are marked as "static"
* by jsdoc, the ones that start with "this." 
* aren't static. I don't know how to make jsdoc
* display them as non-static, so if you do then
* please send a pull request :)
* 
* Methods that deal with detecting whether an
* action took place will throw an InvalidActionException
* if that action did not take place.
*
* Unless you want to explicitly take action in the case
* that some action didn't occur, you don't need to
* catch these exceptions; Trellinator will catch them
* for you. An InvalidActionException is not considered
* "fatal", neither is an InvalidDataException (typically
* thrown by entity classes or the IterableCollection).
*
* If you do want to catch exceptions, you should look
* at the Exceptions.js documentation and the two static methods
* on this class Notification.logException and Notification.expectException
* to see how to do this according to Trellinator best practices
*/
var Notification = function(notification)
{
    this.notification = notification;
    this.board_object = null;
    this.member_object = null;
    this.card_object = null;

    /**
    * If this notification was the result of
    * a member being added to a card, return
    * an object of type Member, otherwise
    * throw an InvalidActionException
    * @memberof module:TrellinatorCore.Notification
    * @throws InvalidActionException
    * @example
    * var notif = new Notification(posted);
    * var comment = "@"+notif.addedMemberToCard().name()+" welcome!";
    * notif.card().postComment(comment);
    */
    this.addedMemberToCard = function(name)
    {
        return this.memberAddedToCard(name);
    }

    /**
    * If this notification was the result of
    * a member being removed from a card, return
    * an object of type Member, otherwise
    * throw an InvalidActionException
    * @memberof module:TrellinatorCore.Notification
    * @throws InvalidActionException
    * @example
    * var notif = new Notification(posted);
    * var comment = "@"+notif.removedMemberFromCard().name()+" welcome!";
    * notif.card().postComment(comment);
    */
    this.removedMemberFromCard = function(name)
    {
      if(
          (this.notification.action.display.translationKey != "action_member_left_card") &&
          (this.notification.action.display.translationKey != "action_removed_member_from_card")
        )
            throw new InvalidActionException("No member removed from card");
      
      var ret = new Member(this.notification.action.member);

      if(name && !TrelloApi.nameTest(name,ret.name()))
        throw new InvalidActionException("Member was removed, but was not named: "+name);
      
      return ret;
    }

    /**
    * If this notification was the result of
    * a member being added to a board, return
    * an object of type Member, otherwise
    * throw an InvalidActionException
    * @memberof module:TrellinatorCore.Notification
    * @param {string|RegExp} optional name (string or regex) to match against username
    * @throws InvalidActionException
    * @example
    * var member = new Notification(posted).addedMemberToBoard();
    */
    this.addedMemberToBoard = function(name)
    {
      if(["action_added_member_to_board","action_added_member_to_board_as_admin"].indexOf(this.notification.action.display.translationKey) == -1)
      {
        throw new InvalidActionException("No member added to a board");
      }
      
      var ret = new Member(this.notification.action.member);
      
      if(name && !TrelloApi.nameTest(name,ret.name()))
      throw new InvalidActionException("The added member was not named "+name);
      
      return ret;
    }

    /**
    * If this notification was the result of
    * a member being removed from a board, return
    * an object of type Member, otherwise
    * throw an InvalidActionException
    * @memberof module:TrellinatorCore.Notification
    * @param {string|RegExp} optional name (string or regex) to match against username
    * @throws InvalidActionException
    * @example
    * var member = new Notification(posted).removedMemberFromBoard();
    */
    this.removedMemberFromBoard = function(name)
    {
        if(this.notification.action.display.translationKey != "action_removed_from_board")
            throw new InvalidActionException("No member removed from a board");
        
        var ret = new Member(this.notification.action.member);

        if(name && !TrelloApi.nameTest(name,ret.name()))
            throw new InvalidActionException("The removed member was not named "+name);
        
        return ret;
    }

    /**
    * A board was created, returns an object of type Board
    * This is true if the board was created or copied from another board
    * @memberof module:TrellinatorCore.Notification
    * @param {string|RegExp} optional name (string or regex) to match against username
    * @throws InvalidActionException
    * @example
    * var board = new Notification(posted).createdBoard();
    */
    this.createdBoard = function()
    {
      if(["action_create_board","action_copy_board"].indexOf(this.notification.action.display.translationKey) == -1)
        throw new InvalidActionException("No member added to a board");
      
      return new Board(this.notification.action.data.board);
    }

    /**
    * A board was copied, returns an object of type Board
    * @memberof module:TrellinatorCore.Notification
    * @param {string|RegExp} optional name (string or regex) to match against username
    * @throws InvalidActionException
    * @example
    * var board = new Notification(posted).copiedBoard();
    */
    this.copiedBoard = function()
    {
      if(["action_copy_board"].indexOf(this.notification.action.display.translationKey) == -1)
        throw new InvalidActionException("No member added to a board");
      
      return new Board(this.notification.action.data.board);
    }

    /**
    * If a checklist item was converted to a card
    * return a Card object, otherwise throw an InvalidActionException
    * @memberof module:TrellinatorCore.Notification
    * @param {string|RegExp} optionally pass in a string or RegExp object
    * to match against the name of the converted checklist item
    * @throws InvalidActionException
    * @example 
    * new Notification(posted)
    * .convertedChecklistItemToCard(new RegExp(".*Carmen San Diego.*"))
    * .checklist().card().postComment("Great work gumshoe!");
    */
    this.convertedChecklistItemToCard = function(name)
    {
        if(this.notification.action.display.translationKey != "action_convert_to_card_from_checkitem")
            throw new InvalidActionException("No checklist item was converted to a card");

        var ret = new Card(this.notification.action.data.card);
        ret.source = new Checklist(this.notification.action.data.checklist)
                     .setContainingCard(new Card(this.notification.action.data.cardSource));
        
        if(name && !TrelloApi.nameTest(name,ret.name()))
            throw new InvalidActionException("A checklist item was converted to a card but it was not named: "+name);

        return ret;
    }

    /**
    * If a checklist was completed as part of this notification
    * return a Checklist object, otherwise throw an InvalidActionException
    * @memberof module:TrellinatorCore.Notification
    * @param {string|RegExp} optionally pass in a string or RegExp object
    * to match against the name of the completed checklist
    * @throws InvalidActionException
    * @example 
    * new Notification(posted)
    * .completedChecklist(new RegExp(".*Carmen San Diego.*"))
    * .card().postComment("Great work gumshoe!");
    */
    this.completedChecklist = function(name)
    {
        if(this.notification.action.display.translationKey != "action_completed_checkitem")
            throw new InvalidActionException("No checklist item was completed, therefore no checklist was completed as part of this action");

        var ret = this.checklist();
        
        if(name && !TrelloApi.nameTest(name,ret.name()))
            throw new InvalidActionException("The completed checklist was not named "+name);

        else
        {
            if(!ret.isComplete())
                throw new InvalidActionException("The checklist in which the item was checked is not complete");

            var completed_actions = new Array();
    
            new IterableCollection(TrelloApi.get("cards/"+this.card().data.id+"/actions?filter=updateCheckItemStateOnCard")).each(function(elem)
            {
                if(elem.data.checkItem.state == "complete")
                    completed_actions.push(elem);
            });
    
            if(this.notification.action.id != completed_actions[0].id)
                throw new InvalidActionException("This was not the most recent completed notification so couldn't be the one that caused the checklist to be completed");
        }
        
        ret.setContainingCard(this.card());
        return ret;
    }

    /**
    * Return a Custom Field object
    * that was changed, optionally pass
    * in a string or regex to match against
    * the name of the field
    * @memberof module:TrellinatorCore.Notification
    * @param {string|RegExp} optionaly pass in a string
    * or RegExp to match against the name of the CARD
    * on which the field was changed
    * @throws InvalidActionException
    * @example
    * var card = new Notification(posted).changedCustomField("Priority").card();
    */
    this.changedCustomField = function(name)
    {
        if(this.notification.action.display.translationKey != "action_update_custom_field_item")
            throw new InvalidActionException("No custom field was changed");

        var ret = new CustomField(this.notification.action.data.customField)
        .setContainingCard(this.card())
        .setItemForCurrentCard(this.notification.action.data.customFieldItem)
        .setOldValue(this.notification.action.data.old);
        
        if(name && !TrelloApi.nameTest(name,ret.name()))
            throw new InvalidActionException("The updated custom field was not named "+name);
        
        return ret;
    }

    /**
    * Return a Card object if a card was moved 
    * from one list to another (either on the same
    * board or to a different board) as 
    * part of this notification, otherwise throw
    * an InvalidActionException
    * @memberof module:TrellinatorCore.Notification
    * @param {string|RegExp} optionaly pass in a string
    * or RegExp to match against the name of the LIST 
    * into which the card was moved
    * @throws InvalidActionException
    * @example
    * var notif = new Notification(posted);
    * var card = notif.movedCard(new RegExp("Done.*"));
    * var from = notif.listBefore().name();
    * var to = notif.listAfter().name();
    * card.postComment(from+" to "+to);
    */
    this.movedCard = function(name)
    {
        this.listCardWasMovedTo(name);
        return this.card();
    }

    /**
    * Return a Card object if a card was added
    * to a list as part of this notification.
    * The "added" event can be any way that a card
    * can arrive in a list, either by being
    * created, copied, moved (within the same board
    * or from a different board) or emailed to 
    * the board. If none of these things happened
    * throws an InvalidActionException
    * @memberof module:TrellinatorCore.Notification
    * @param {string|RegExp} optionaly pass in a string
    * or RegExp to match against the name of the LIST 
    * into which the card was added
    * @throws InvalidActionException
    * @example
    * new Notification(posted)
    * .addedCard(new RegExp("ToDo.*"))
    * .postComment("Hi there!");
    */
    this.addedCard = function(name)
    {
        this.listCardWasAddedTo(name);
        return this.card();
    }
    
    /**
    * Return a Card object if a card was created
    * on this board as part of this notification.
    * The "created" event can be any way that a card
    * can be added to a board for the first time,
    * ie. created by a user, copied from another card
    * including from a different board or emailed to
    * the board. If none of these things happened
    * throws an InvalidActionException
    * @memberof module:TrellinatorCore.Notification
    * @param {string|RegExp} optionaly pass in a string
    * or RegExp to match against the name of the LIST 
    * in which the card was created
    * @throws InvalidActionException
    * @example
    * new Notification(posted)
    * .createdCard(new RegExp("Incoming.*"))
    * .postComment("Hi there!");
    */
    this.createdCard = function(name)
    {
        this.listCardWasCreatedIn(name);
        return this.card();
    }

    /**
    * Return a Checklist object if a 
    * checklist was added to a card as part
    * of this notification or throw an
    * InvalidActionException
    * @memberof module:TrellinatorCore.Notification
    * @param name {string|RegExp} optionally pass in a string or RegExp
    * to match against the name of the checklist that was added to the
    * card
    * @throws InvalidActionException
    * @example
    * new Notification(posted)
    * .addedChecklist(new RegExp(".*Ghosts.*"))
    * .addItem("Who you gonna call?");
    */
    this.addedChecklist = function(name)
    {
        if(!this.notification.action.display.translationKey == "action_add_checklist_to_card")
            throw new InvalidActionException("No checklist was added to a card");
        
        var ret = new Checklist(this.notification.action.display.entities.checklist);

        if(name && !TrelloApi.nameTest(name,ret.name()))
            throw new InvalidDataException("A checklist was added but it was not named: "+name+" it was named: "+ret.name());

        ret.setContainingCard(this.card());
        return ret;
    }

    /**
    * Return a Board object that a card was moved
    * from or throw InvalidActionException.
    * @memberof module:TrellinatorCore.Notification
    * @throws InvalidActionException
    * @example
    * new Notification(posted)
    * .boardBefore().name();
    */
    this.boardBefore = function()
    {
        if(this.notification.action.display.translationKey != "action_move_card_to_board")
        {
          throw new InvalidActionException("Card not moved from a board");
        }
      
        try
        {
            var ret = this.listBefore().board();
        }
        
        catch(e)
        {
            Notification.expectException(InvalidActionException,e);
            
            if(!this.notification.action.data.boardSource)
                throw new InvalidActionException("No boardSource, no listBefore");

            var ret = new Board(this.notification.action.data.boardSource);
        }

        return ret;
    }

    /**
    * Return a List object that a card
    * was moved out of if a card was
    * moved as part of this notification,
    * or return an InvalidActionException
    * @memberof module:TrellinatorCore.Notification
    * @throws InvalidActionException
    * @example
    * new Notification(posted)
    * .listBefore().cards()
    * .first()
    * .postComment("We'll miss you!");
    */
    this.listBefore = function()
    {
        if(this.notification.action.data.listBefore)
            ret = new List(this.notification.action.data.listBefore);
        else
            throw new InvalidActionException("No list before");
        
        return ret;
    }

    /**
    * Return a List object that a card
    * was moved into if a card was
    * moved as part of this notification,
    * or return an InvalidActionException
    * @memberof module:TrellinatorCore.Notification
    * @throws InvalidActionException
    * @example
    * new Notification(posted)
    * .listAfter().cards()
    * .first()
    * .postComment("Welcome friend!");
    */
    this.listAfter = function()
    {
        if(this.notification.action.data.listAfter)
            ret = new List(this.notification.action.data.listAfter);
        else
            throw new InvalidActionException("No list after");
        
        return ret;
    }

    /**
    * Return a List object that was created
    * or moved from another board
    * @memberof module:TrellinatorCore.Notification
    * @throws InvalidActionException
    * @example
    * Card.create(new Notification(posted)
    * .addedList(),"Welcome to the list!");
    */
    this.addedList = function()
    {
        
        if(["action_added_list_to_board","action_move_list_to_board"].indexOf(this.notification.action.display.translationKey) > -1)
            ret = new List(this.notification.action.data.list);
        else
            throw new InvalidActionException("No list added");

        return ret;
    }

    /**
    * Return a List object that was created
    * @memberof module:TrellinatorCore.Notification
    * @throws InvalidActionException
    * @example
    * Card.create(new Notification(posted)
    * .createdList(),"Welcome to the list!");
    */
    this.createdList = function()
    {
        if(["action_added_list_to_board"].indexOf(this.notification.action.display.translationKey) > -1)
            ret = new List(this.notification.action.data.list);
        else
            throw new InvalidActionException("No list created");

        return ret;
    }

    /**
    * Return a List object that was archived
    * @memberof module:TrellinatorCore.Notification
    * @throws InvalidActionException
    * @example
    * new Notification(posted)
    * .archivedList().unArchive();
    */
    this.archivedList = function()
    {
        if(["action_archived_list"].indexOf(this.notification.action.display.translationKey) > -1)
            ret = new List(this.notification.action.data.list);
        else
            throw new InvalidActionException("No list archived");

        return ret;
    }

    /**
    * Return the previous value after a change
    * @memberof module:TrellinatorCore.Notification
    * @throws InvalidActionException
    * @example
    * new Notification(posted)
    * .changedCardName().setName(new Notification(posted).oldValue());
    * 
    */
    this.oldValue = function()
    {
        if(this.notification.action.data.old)
        {
            for(var key in this.notification.action.data.old)
                return this.notification.action.data.old[key];
        }
        
        else
        {
            throw new InvalidActionException("No old value present");
        }
    }

    /**
    * Return the name of the attribute that changed
    * @memberof module:TrellinatorCore.Notification
    * @throws InvalidActionException
    * @example
    * var notif = new Notification(posted);
    * notif
    * .changedCardName().setName(notif.oldValue());
    * notif.replyToMember("You changed: "+notif.whatChanged());
    */
    this.whatChanged = function()
    {
        if(this.notification.action.data.old)
        {
            for(var key in this.notification.action.data.old)
                return key;
        }
        
        else
        {
            throw new InvalidActionException("No old value present");
        }
    }

    /**
    * Return a List object that had
    * it's name changed or throws
    * an InvalidActionException if no
    * list name was changed
    * @memberof module:TrellinatorCore.Notification
    * @throws InvalidActionException
    * @example
    * new Notification(posted)
    * .changedListName()
    * .cards().first()
    * .postComment("My name changed");
    */
    this.changedListName = function()
    {
        return this.updatedList();
    }

    /**
    * Return a Card object if the
    * name/title of the card was
    * changed or throw an InvalidActionException
    * if no card name was changed
    * @memberof module:TrellinatorCore.Notification
    * @throws InvalidActionException
    * @example
    * new Notification(posted)
    * .changedCardName()
    * .postComment("how dare you!");
    */
    this.changedCardName = function()
    {
        return this.cardWithNameChanged();
    }

    /**
    * Return a Card object if the
    * description of the card was
    * changed or throw an InvalidActionException
    * if no card description was changed
    * @memberof module:TrellinatorCore.Notification
    * @param {string|RegExp} optionally pass in a name of card to match
    * @throws InvalidActionException
    * @example
    * new Notification(posted)
    * .changedCardDescription()
    * .postComment("how dare you!");
    */
    this.changedCardDescription = function(name)
    {
        if(this.notification.action.display.translationKey != "action_changed_description_of_card")
            throw new InvalidActionException("Card description was not changed");

        var ret = this.card();

        if(name && !TrelloApi.nameTest(name,ret.name()))
            throw new InvalidActionException("Card item named: "+ret.name()+" description updated which doesn't match: "+name);
        
        return ret;
    }
    
    /**
    * Return previous desc if it was changed
    * as part of this notification
    * @memberof module:TrellinatorCore.Notification
    * @param {string|RegExp} optionally pass in a name of card to match
    * @throws InvalidActionException
    * @example
    * new Notification(posted)
    * .oldCardDescription();
    */
    this.oldCardDescription = function(name)
    {
      var ret = null;

      if(this.notification && this.notification.action && this.notification.action.data && this.notification.action.data.old && this.notification.action.data.old.desc)
        ret = this.notification.action.data.old.desc;
      else
        throw new InvalidDataException("No old description, probably it wasn't just changed");
        
      return ret;
    }

    /**
    * Return a Card object if the
    * due date was marked complete
    * or throw an InvalidActionException
    * if no due date was completed
    * @memberof module:TrellinatorCore.Notification
    * @throws InvalidActionException
    * @example
    * new Notification(posted)
    * .completedDueDate()
    * .postComment("Feels gooood :)");
    */
    this.completedDueDate = function()
    {
        return this.cardDueDateWasCompletedOn();
    }

    /**
    * Return a Member object if the
    * member's username was mentioned
    * in a comment or throw an InvalidActionException
    * if no due date was completed.
    * This will apply only to members who were mentioned
    * who are part of this board, rather than arbitrary
    * strings preceded by an @ sign
    * @memberof module:TrellinatorCore.Notification
    * @param {string|RegExp} optionally pass in a string
    * or RegExp to match against the mentioned member's
    * username
    * @throws InvalidActionException
    * @example
    * new Notification(posted)
    * .mentionedMember("johnnydepp")
    * .postComment("Yarrrrr");
    */
    this.mentionedMember = function(name)
    {
        return this.memberMentionedInComment(name);
    }

    /**
    * Return an IterableCollection of Member objects
    * that were mentioned in a comment, or throw
    * an InvalidActionException if no members were 
    * mentioned. This applies only to members who
    * are actually on the board, so won't consider
    * any string preceded by an @ sign as a member
    * name
    * @memberof module:TrellinatorCore.Notification
    * @throws InvalidActionException
    * @example
    * var notif = new Notification(posted);
    * notif.mentionedMembers()
    * .each(function(member)
    * {
    *     notif.card().addMember(member);
    * });
    */
    this.mentionedMembers = function()
    {
        return this.membersMentionedInComment();
    }

    /**
    * Return a Comment object if a comment
    * was added to a card as part of this
    * Notification, or throw an InvalidActionException.
    * BEWARE!! It's very easy to create "infinite loops"
    * if you don't filter out comments added by 
    * Trellinator itself.
    * @memberof module:TrellinatorCore.Notification
    * @throws InvalidActionException
    * @example
    * var notif = new Notification(posted);
    * var comment = notif.addedComment();
    * 
    * if(notif.member().notTrellinator())
    *     notif.card().postComment("Okay!");
    */
    this.addedComment = function()
    {
        return this.commentAddedToCard();
    }

    /**
    * Return a Card object if it was archived
    * as part of this notification, or throw
    * an InvalidActionException
    * @memberof module:TrellinatorCore.Notification
    * @throws InvalidActionException
    * @example
    * new Notification(posted)
    * .archivedCard()
    * .unArchive()
    * .postComment("No you don't!");
    */
    this.archivedCard = function()
    {
        if(this.notification.action.display.translationKey != "action_archived_card")
            throw new InvalidActionException("No card was archived in this update");
        
        return this.card();
    }
   
    /**
    * Return a Card object if a due 
    * date was added as part of this notification,
    * or throw an InvalidActionException
    * @memberof module:TrellinatorCore.Notification
    * @throws InvalidActionException
    * @example
    * new Notification(posted)
    * .addedDueDate()
    * .postComment("Roger that!");
    */
    this.addedDueDate = function()
    {
        return this.cardDueDateWasAddedTo();
    }

    /**
    * Return a Label object if a label
    * was added to a card as part of this notification,
    * or throw an InvalidActionException
    * @memberof module:TrellinatorCore.Notification
    * @param {string|RegExp} optionally pass in a 
    * string or RegExp to match against the name of
    * the label that was added
    * @throws InvalidActionException
    * @example
    * new Notification(posted)
    * .addedLabel(new RegExp("Charles.*"))
    * .postComment("In Charge!");
    */
    this.addedLabel = function(name)
    {
        return this.labelAddedToCard(name);
    }

    /**
    * Return a Card object if all checklists
    * were completed as part of this notification,
    * or throw an InvalidActionException
    * @memberof module:TrellinatorCore.Notification
    * @throws InvalidActionException
    * @example
    * new Notification(posted)
    * .completedAllChecklists()
    * .moveToNextList();
    */
    this.completedAllChecklists = function()
    {
        return this.cardAllChecklistsAreCompleteOn();
    }

    /**
    * Return a CheckItem object if it was
    * marked as complete or throw an InvalidActionException
    * @memberof module:TrellinatorCore.Notification
    * @param {string|RegExp} optionally include a string
    * or RegExp object to match against the text of the completed item
    * @throws InvalidActionException
    * @example
    * new Notification(posted)
    * .completedChecklistItem(new RegExp("URGENT.*"))
    * .card()
    * .postComment("Crisis averted");
    */
    this.completedChecklistItem = function(name)
    {
        if(this.notification.action.display.translationKey != "action_completed_checkitem")
            throw new InvalidActionException("No checklist item was completed");

        var ret = new CheckItem(this.notification.action.display.entities.checkitem);
        
        if(name && !TrelloApi.nameTest(name,ret.name()))
            throw new InvalidActionException("A checklist item was completed but it was not named: "+name);

        ret.setContainingChecklist(this.checklist().setContainingCard(this.card()));
        return ret;
    }
    
    /**
    * Return a CheckItem object if it was added to a checklist
    * @memberof module:TrellinatorCore.Notification
    * @param {string|RegExp} optionally only look for a checklist item matching a string or regex
    * or RegExp object to match against the text of the completed item
    * @throws InvalidActionException
    * @example
    * new Notification(posted)
    * .addedChecklistItem(/.*Fluffy.*Bunny/)
    * .card()
    * .postComment("Cute ^_^");
    */
    this.addedChecklistItem = function(name)
    {
        if(this.notification.action.type && (this.notification.action.type == "createCheckItem"))
        {
            var ret = new CheckItem(this.notification.action.data.checkItem);

            if(name && !TrelloApi.nameTest(name,ret.name()))
                throw new InvalidActionException("Checklist item named: "+ret.name()+" added which doesn't match: "+name);

            ret.setContainingChecklist(this.checklist().setContainingCard(this.card()));
        }
        
        else
        {
            throw new InvalidActionException("No checklist item was created");
        }
        
        return ret;
    }

    /**
    * Return an Attachment object which will
    * hold a reference to the Card object via
    * the card() method, if an attachment was
    * added to a card as part of this notification
    * and that attachment was a Trello Board
    * @memberof module:TrellinatorCore.Notification
    * @throws InvalidActionException
    * @example
    * new Notification(posted)
    * .attachedBoard()
    * .card().postComment("I have a Trello Board");
    */
    this.attachedBoard = function(name)
    {
        if(this.notification.action.display.translationKey != "action_add_attachment_to_card")
            throw new InvalidActionException("No attachment was added to a card");
        
        ret = new Attachment(this.notification.action.display.entities.attachment);
        
        if(!ret.isBoard())
            throw new InvalidActionException("An attachment was added but it wasn't a board");

        return ret.setContainingCard(this.card());
    }

    /**
    * Return an Attachment object which will
    * hold a reference to the Card object via
    * the card() method, if an attachment was
    * added to a card as part of this notification
    * and that attachment was a Trello card
    * @memberof module:TrellinatorCore.Notification
    * @throws InvalidActionException
    * @example
    * new Notification(posted)
    * .attachedCard()
    * .card().postComment("I have a Trello Card");
    */
    this.attachedCard = function(name)
    {
        if(this.notification.action.display.translationKey != "action_add_attachment_to_card")
            throw new InvalidActionException("No attachment was added to a card");
        
        ret = new Attachment(this.notification.action.display.entities.attachment);
        
        if(!ret.isCard())
            throw new InvalidActionException("An attachment was added but it wasn't a card");

        return ret.setContainingCard(this.card());
    }

    /**
    * Return an Attachment object which will
    * hold a reference to the Card object via
    * the card() method, if an attachment was
    * added to a card as part of this notification
    * and that attachment was a file optionally with
    * a file name matching a regex or string passed in
    * @memberof module:TrellinatorCore.Notification
    * @param {string|RegExp} optionaly pass in a string
    * or RegExp to match against the name of the file
    * (not the name of the attachment)
    * @throws InvalidActionException
    * @example
    * new Notification(posted)
    * .attachedFile(new RegExp("*.pdf","i"))
    * .card().postComment("I have a PDF file");
    */
    this.attachedFile = function(name)
    {
        if(this.notification.action.display.translationKey != "action_add_attachment_to_card")
            throw new InvalidActionException("No attachment was added to a card");
        
        ret = new Attachment(this.notification.action.display.entities.attachment);

        if(!ret.isFile())
            throw new InvalidActionException("An attachment was added but it wasn't a file");
        if(name && !TrelloApi.nameTest(name,ret.link()))
            throw new InvalidActionException("Attachment with url: "+ret.link()+" did not match: "+name);
        
        return ret.setContainingCard(this.card());
    }

    /**
    * Return an Attachment object which will
    * hold a reference to the Card object via
    * the card() method, if an attachment was
    * added to a card as part of this notification
    * and that attachment was a link/URL, optionally
    * matching a regex or string passed in
    * @memberof module:TrellinatorCore.Notification
    * @param {string|RegExp} optionaly pass in a string
    * or RegExp to match against the URL of the attachment
    * @throws InvalidActionException
    * @example
    * new Notification(posted)
    * .attachedLink(new RegExp("*google.com*"))
    * .card().postComment("I have a new Google link");
    */
    this.attachedLink = function(name)
    {
        if(this.notification.action.display.translationKey != "action_add_attachment_to_card")
            throw new InvalidActionException("No attachment was added to a card");
        
        ret = new Attachment(this.notification.action.display.entities.attachment);
        
        if(!ret.isLink())
            throw new InvalidActionException("An attachment was added but it wasn't a link");
        if(
              (name && !TrelloApi.nameTest(name,ret.link())) &&
              (name && !TrelloApi.nameTest(name,ret.text()))
          )
            throw new InvalidActionException("Attachment with url: "+ret.link()+" and name: "+ret.text()+" did not match "+name);

        return ret.setContainingCard(this.card());
    }

    /**
    * Return the Member object who initiated this
    * notification. Since all notifications are at
    * the board level, this will always return 
    * a valid Member object
    * @memberof module:TrellinatorCore.Notification
    * @example
    * var notif = new Notification(posted);
    * var comment = notif.member().name()+" dug a hole");
    * notif.card()
    *.postComment(comment);
    */
    this.member = function()
    {
        if(!this.member_object)
            this.member_object = new Member(this.notification.action.memberCreator);
        
        return this.member_object;
    }

    /**
    * Throw an invalid action exception if the 
    * notification came in on a member webhook
    * rather than a board webhook
    * @memberof module:TrellinatorCore.Notification
    * @example
    * new Notification(posted)
    * .ignoreMemberWebhooks()
    */
    this.ignoreMemberWebhooks = function()
    {
        if(this.notification.model.id != this.notification.action.data.board.id)
            throw new InvalidActionException("We are only worried about notifications at the board level");
    }

    /**
    * Return the Board object on which this action
    * was performed. Since all notifications are at
    * the board level, this will always return 
    * a valid Board object
    * @memberof module:TrellinatorCore.Notification
    * @example
    * new Notification(posted)
    * .board().card("Updates")
    * .postComment("Something happened!");
    */
    this.board = function()
    {
        if(!this.board_object)
        {
            if(this.notification.model.id == this.notification.action.data.board.id)
                this.board_object = new Board(this.notification.model);
            else
                this.board_object = new Board(this.notification.action.data.board);
        }
        
        return this.board_object;
    }

    /**
    * Return the Card object on which this
    * action was performed. If this action
    * was not performed on a card, throw an
    * InvalidActionException
    * @memberof module:TrellinatorCore.Notification
    * @example
    * new Notification(posted)
    * .card().postComment("You rang?");
    */
    this.card = function()
    {
        if(!this.notification.action.display.entities.card && !this.notification.action.data.card)
            throw new InvalidActionException("No card was part of this notification");

        if(!this.card_object)
        {
            if(this.notification.action.display.entities.card)
                this.card_object = new Card(this.notification.action.display.entities.card);
            else if(this.notification.action.data.card)
                this.card_object = new Card(this.notification.action.data.card);
        }
        
        return this.card_object.setNotification(this);
    }

    /**
    * Post a comment on the card associated with
    * this notification mentioning the member who
    * initiated the notification
    * @memberof module:TrellinatorCore.Notification
    * @param message {string} the message to post, without
    * a username (this will be added automatically)
    * @example
    * new Notification(posted)
    * .replyToMember("Aaaaaaas yoooooou wiiiiiiiish!");
    */
    this.replyToMember = function(message)
    {
      this.card().postComment("@"+this.member().name()+" "+message);
      return this.card();
    }

    /**
    * Schedule a function to be executed by the
    * Execution Queue at some point relative to
    * the due date added to or edited on a card.
    * 
    * By default, will execute on the due date, but
    * you can optionally pass in a callback to modify
    * the date relative to the due date of the card.
    * 
    * @memberof module:TrellinatorCore.Notification
    * @param function_name {string} the name of the function to execute
    * @param signature {string} an arbitrary string but usually just the signature
    * passed into the original function
    * @param callback {Function} (optional) a function into which the due date
    * as a Date object, and a second argument with the notification params that
    * will be passed into the function
    * @example
    * new Notification(posted).actionOnDueDateAdded("doSomething",signature,function(date,params)
    * {
    *     date.addDays(3).at("9:00");
    *     params.arbitrary_string = "I ain't afraid of no ghost";
    * });
    */
    this.actionOnDueDateAdded = function(function_name,signature,callback)
    {
        var card = this.cardDueDateWasAddedTo();      
        this.pushDueDateActionForCard(function_name,signature,callback,card);
    }
    
    /**
    * Schedule a function to be executed by the
    * Execution Queue at some point relative to
    * the due date on a card, even if the due date
    * was not added as part of the notification.
    *
    * It is therefore important to use this in
    * conjunction with another notification type 
    * because otherwise any notification for a card
    * with a due date will schedule the function to
    * execute.
    * 
    * By default, will execute on the due date, but
    * you can optionally pass in a callback to modify
    * the date relative to the due date of the card.
    * 
    * @memberof module:TrellinatorCore.Notification
    * @param function_name {string} the name of the function to execute
    * @param signature {string} an arbitrary string but usually just the signature
    * passed into the original function
    * @param callback {Function} (optional) a function into which the due date
    * as a Date object, and a second argument with the notification params that
    * will be passed into the function
    * @example
    * try
    * {
    *     var notif = new Notification(posted);
    *     notif.createdCard();
    *     //Action 3 days after the due date on a card only
    *     //if the card was just created
    *     notif.actionOnDueDate("doSomething",signature,function(date,params)
    *     {
    *         date.addDays(3).at("9:00");
    *         params.arbitrary_string = "I ain't afraid of no ghost";
    *     });
    * }
    */
    this.actionOnDueDate = function(function_name,signature,callback)
    {
        try
        {
          var card = this.cardDueDateWasAddedTo();
        }
      
        catch(e)
        {
          var card = this.card();
          
          if(!card.due())
             throw new InvalidActionException("Unable to action on due date, there is no due date on the card");
        }
      
        this.pushDueDateActionForCard(function_name,signature,callback,card);
    }
    
    //This is for internal use only
    this.pushDueDateActionForCard = function(function_name,signature,callback,card)
    {
        var params = {};
        
        if(!callback)
            callback = function(){}
            
        var trigger_signature = signature+card.data.id;
        clear(trigger_signature);
        params = this.notification;
        var date = new Date(card.due());
        callback(date,params);
        ExecutionQueue.push(function_name,params,trigger_signature,date);
    }

    //Deprecated
    this.checklist = function()
    {
        return new Checklist(this.notification.action.data.checklist);
    }

    //Deprecated: use movedCard instead
    this.listCardWasMovedTo = function(name)
    {
        if(["action_move_card_from_list_to_list"].indexOf(this.notification.action.display.translationKey) > -1)
            var ret = new List(this.notification.action.display.entities.listAfter);
        else if(["action_move_card_to_board"].indexOf(this.notification.action.display.translationKey) > -1)
            var ret = this.card().currentList();
        else
            throw new InvalidActionException("Card was not moved to a list");

        if(name && !TrelloApi.nameTest(name,ret.name()))
            throw new InvalidActionException("Card was moved to : "+ret.name()+" rather than "+name);
        
        return ret;
    }

    //Deprecated: use createdCard instead
    this.listCardWasCreatedIn = function(name)
    {
        if(["action_create_card","action_copy_card","action_email_card"].indexOf(this.notification.action.display.translationKey) > -1)
            var ret = new List(this.notification.action.display.entities.list);
        else if(["action_convert_to_card_from_checkitem"].indexOf(this.notification.action.display.translationKey) > -1)
            var ret = new List(this.notification.action.data.list);
        else
            throw new InvalidActionException("Card was not created in a list");

        if(name && !TrelloApi.nameTest(name,ret.name()))
            throw new InvalidActionException("Card was created in : "+ret.name()+" rather than "+name);
        
        return ret;
    }

    //Deprecated: use addedCard instead
    this.listCardWasAddedTo = function(name)
    {
        if(["action_create_card","action_copy_card","action_email_card"].indexOf(this.notification.action.display.translationKey) > -1)
            var ret = new List(this.notification.action.display.entities.list);
        else if(["action_move_card_to_board","action_convert_to_card_from_checkitem"].indexOf(this.notification.action.display.translationKey) > -1)
            var ret = new List(this.notification.action.data.list);
        else if(["action_move_card_from_list_to_list"].indexOf(this.notification.action.display.translationKey) > -1)
            var ret = new List(this.notification.action.display.entities.listAfter);
        else
            throw new InvalidActionException("Card was not added to a list");

        if(name && !TrelloApi.nameTest(name,ret.name()))
            throw new InvalidActionException("Card was added in: \""+ret.name()+"\" rather than "+name);
        
        return ret;
    }

    //Deprecated: use addedMember instead
    this.memberAddedToCard = function(name)
    {
      if(
          (this.notification.action.display.translationKey != "action_member_joined_card") &&
          (this.notification.action.display.translationKey != "action_added_member_to_card")
        )
            throw new InvalidActionException("No member added to card");
      
      var ret = new Member(this.notification.action.member);

      if(name && !TrelloApi.nameTest(name,ret.name()))
        throw new InvalidActionException("Member was added, but was not named: "+name);
      
      return ret.setContainingCard(this.card());
    }

    //Deprecated: use addedComment instead
    this.commentAddedToCard = function()
    {
        if(this.notification.action.display.translationKey != "action_comment_on_card")
            throw new InvalidActionException("No comment added as part of this notification");
        
        var data = {data: {id: this.notification.action.id,
                    text: this.notification.action.data.text}};
        return new Comment(data).setContainingCard(this.card());
    }

    //Deprecated: use completedDueDate instead
    this.cardDueDateWasCompletedOn = function()
    {
        if(this.notification.action.display.translationKey != "action_marked_the_due_date_complete")
            throw new InvalidActionException("Due date not marked complete");
        
        return this.card();
    }

    //Deprecated: use mentionedMember instead
    this.memberMentionedInComment = function(name)
    {
        return this.membersMentionedInComment().findByName(name).first();
    }

    //Deprecated: use mentionedMembers instead
    this.membersMentionedInComment = function()
    {
        var comment = this.commentAddedToCard();
        var ret     = new Array();

        this.board().members().each(function(member)
        {
            if(new RegExp("(^|\\b|\\s)@"+member.name()+"(\\b|\\s|$)","i").test(comment.text()))
                ret.push(member);
        });
        
        if(!ret.length)
            throw new InvalidActionException("No members were mentioned in this comment");
        
        return new IterableCollection(ret);
    }

    //Deprecated: use dueDateAdded instead
    this.cardDueDateWasAddedTo = function()
    {
        if(
            (this.notification.action.display.translationKey != "action_added_a_due_date")&&
            (this.notification.action.display.translationKey != "action_changed_a_due_date")
          )
            throw new InvalidActionException("No due date was added");
        
        return this.card();
    }

    //Deprecated: use addedLabel instead
    this.labelAddedToCard = function(name)
    {
        if(this.notification.action.display.translationKey != "action_add_label_to_card")
            throw new InvalidActionException("No label as added to a card");
        
        var ret = new Label(this.notification.action.data.label);
        
        if(name && !TrelloApi.nameTest(name,ret.name()))
            throw new InvalidActionException("Label was added, but was not named: "+name);
        
        return ret.setContainingCard(this.card());
    }

    //Deprecated: use completedAllChecklists instead
    this.cardAllChecklistsAreCompleteOn = function()
    {
        var item = this.completedChecklist();
        
        this.card().checklists().each(function(list)
        {
            if(!list.isComplete())
                throw new InvalidActionException("There is an incomplete checklist on "+this.card().name()+" name "+list.name());
        });
        
        return this.card();
    }

    //DEPRECATED: use changedCardName()
    this.cardWithNameChanged = function()
    {
        if(this.notification.action.display.translationKey != "action_renamed_card")
            throw new InvalidActionException("Card name was not changed");
        
        return this.card();
    }

    //DEPRECATED: use changedListName
    this.updatedList = function()
    {
        if(this.notification.action.data.list)
            ret = new List(this.notification.action.data.list);
        else
            throw new InvalidActionException("List not updated");
        
        return ret;
    }
}

/**
* When you catch an exception, throw it again
* if it is not the type you expected. This is 
* useful when catching exceptions thrown by 
* entity classes such as Card and Board. These
* will throw InvalidDataExceptions but will 
* never intentionally throw a ReferenceError
* for example.
* @memberof module:TrellinatorCore.Notification
* @param type {Function} the constructor function of an
* exception, typically one from Exceptions.js
* @param e {Object} the exception you caught
* @example
* var notif = new Notification(posted);
* //Remove any labels that were added that
* //aren't "Urgent"
* try
* {
*     var label = notif.addedLabel("Urgent");
* }
*
* catch(e)
* {
*     Notification.expectException(InvalidDataException,e);
*     notif.card().removeLabel(notif.addedLabel());
* }
*/
Notification.expectException = function(type,e)
{
  if(!Array.isArray(type))
    type = [type];
  
  if(type.indexOf(e.constructor) == -1)
    throw e;
}

/**
* Log a message in the Info Log tab if this is a
* non fatal exception, or what is considered
* an "Expected Exception" from the types in 
* Exceptions.js. These are exceptions thrown
* by the Notification class and entity classes
* like Card and Board. This static method will
* write any message from an "expected" exception
* to Info Log and rethrow the exception if it
* isn't one of these types. This method is used
* by Trellinator when executing functions anyway
* so you don't need to wrap all your functions
* using this try/catch, however it can be useful
* to have a shorthand way of creating a log entry
* for expected exceptions and then taking some
* other action, but halting execution if the
* exception was not expected
* @memberof module:TrellinatorCore.Notification
* @param message {string} prepend the exception message
* @param e {Object} the exception that was caught
* @example
* var notif = new Notification(posted);
*
* try
* {
*     notif.card().postComment("Hi there!");
* }
* 
* catch(e)
* {
*     Notification.logException("We didn't see a card",e);
* }
*/
Notification.logException = function(message,e)
{
    if(e.constructor == InvalidDataException)
        Trellinator.log(message+": "+e);
    else if(e.constructor == InvalidActionException)
        Trellinator.log(message+": "+e);
    else
        throw e;
}

//Deprecated
Notification.fromDueDateAction = function(params)
{
    var ret = null;

    if(params.notification)
        ret = new Notification(params.notification.notification);
    else
        ret = new Notification(params);

    return ret;
}

