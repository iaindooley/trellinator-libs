var Notification = function(notification)
{
    this.notification = notification;
    
    this.cardWithNameChanged = function()
    {
        if(this.notification.action.display.translationKey != "action_renamed_card")
            throw new Error("Card name was not changed");
        
        return this.card();
    }

    this.cardDueDateWasCompletedOn = function()
    {
        if(this.notification.action.display.translationKey != "action_marked_the_due_date_complete")
            throw new Error("Due date not marked complete");
        
        return this.card();
    }

    this.actionOnDueDate = function(function_name,signature,params)
    {
        if(!params)
            params = {};

        var card = this.cardDueDateWasAddedTo();
        var trigger_signature = signature+card.data.id;
        clear(trigger_signature);
        params.notification = this;
        push(new Date(card.due()),{functionName: function_name,parameters: params},trigger_signature);
    }

    this.commentAddedToCard = function()
    {
        if(this.notification.action.display.translationKey != "action_comment_on_card")
            throw new Error("No comment added as part of this notification");
        
        var data = {data: {id: this.notification.action.id,
                    text: this.notification.action.data.text}};
        return new Comment(data);
    }

    this.archivedCard = function()
    {
        if(this.notification.action.display.translationKey != "action_archived_card")
            throw new Error("No card was archived in this update");
        
        return this.card();
    }
   
    this.cardDueDateWasAddedTo = function()
    {
        if(
            (this.notification.action.display.translationKey != "action_added_a_due_date")&&
            (this.notification.action.display.translationKey != "action_changed_a_due_date")
          )
            throw new Error("No due date was added");
        
        return this.card();
    }

    this.labelAddedToCard = function(name)
    {
        if(this.notification.action.display.translationKey != "action_add_label_to_card")
            throw new Error("No label as added to a card");
        
        var ret = new Label(this.notification.action.data.label);
        
        if(name && (ret.name() != name))
            throw new Error("Label was added, but was not named: "+name);
        
        return ret;
    }

    this.completedChecklistItem = function(name)
    {
        if(this.notification.action.display.translationKey != "action_completed_checkitem")
            throw new Error("No checklist item was completed");

        var ret = new CheckItem(this.notification.action.display.entities.checkitem);
        
        if(name && (ret.name() != name))
            throw new Error("A checklist item was completed but it was not named: "+name);

        ret.setContainingChecklist(this.checklist().setContainingCard(this.card()));
        return ret;
    }

    this.member = function()
    {
        return new Member(this.notification.action.memberCreator);
    }

    this.checklist = function()
    {
        return new Checklist(this.notification.action.data.checklist);
    }

    this.completedChecklist = function(name)
    {
        if(this.notification.action.display.translationKey != "action_completed_checkitem")
            throw new Error("No checklist item was completed, therefore no checklist was completed as part of this action");

        var ret = this.checklist();
        
        if(name && !TrelloApi.nameTest(name,ret.name()))
            throw new Error("The completed checklist was not named "+name);
        else if(!ret.isComplete())
            throw new Error("The checklist in which the item was checked is not complete");
        
        ret.setContainingCard(this.card());
        return ret;
    }

    this.listCardWasMovedTo = function()
    {
        if(this.notification.action.display.translationKey == "action_move_card_from_list_to_list")
            var ret = new List(this.notification.action.display.entities.listAfter);
        else
            throw new Error("Card was not moved to a list");
        
        return ret;
    }

    this.listCardWasAddedTo = function()
    {
        if(new IterableCollection(["action_create_card","action_copy_card","action_email_card"]).hasMember(this.notification.action.display.translationKey))
            var ret = new List(this.notification.action.display.entities.list);
        else if(new IterableCollection(["action_move_card_to_board","action_convert_to_card_from_checkitem"]).hasMember(this.notification.action.display.translationKey))
            var ret = new List(this.notification.action.data.list);
        else if(new IterableCollection(["action_move_card_from_list_to_list"]).hasMember(this.notification.action.display.translationKey))
            var ret = new List(this.notification.action.display.entities.listAfter);
        else
            throw new Error("Card was not added to a list");
        
        return ret;
    }

    this.board = function()
    {
        return new Board(this.notification.model);
    }

    this.card = function()
    {
        return new Card(this.notification.action.display.entities.card);
    }
}
