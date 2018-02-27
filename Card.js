var Card = function(data)
{    
    this.data         = data;
    this.last_comment = null;
    this.set_due      = null;
    this.moved        = null;
  
    this.name = function()
    {
        if(!this.data.name)
            this.load();
        
        return this.data.name;
    }
    
    this.setDescription(desc)
    {
        console.log("implement me setDescritption");
        process.exit();
        return this;
    }

    this.postComment = function(comment_text)
    {
        this.last_comment = TrelloApi.post("cards/"+this.data.id+"/actions/comments?text="+encodeURIComponent(comment_text));
        return this;
    }

    this.setDue = function(datetime)
    {
        this.set_due = TrelloApi.put("cards/"+this.data.id+"?due="+encodeURIComponent(datetime));
        return this;
    }

    this.moveTo = function(data)
    {
        if(!this.data.board)
            this.load();

        this.moved = TrelloApi.put("cards/"+this.data.id+"?idList="+Board(this.data.board).list({name: data.list}).data.id+"&pos="+data.position);
        return this;
    }
    
    this.archive = function()
    {
        console.log("Implement me archive");
        process.exit();
        return this;
    }

    this.unArchive = function()
    {
        console.log("Implement me unarchive");
        process.exit();
        return this;
    }
    
    this.addChecklist = function(name,callback)
    {
        var checklist = Checklist(TrelloApi.post(add checklist));
        callback(checklist);
        return this;
    }

    this.load = function()
    {
        this.data = TrelloApi.get("cards/"+this.data.id+"?fields=all&actions=all&attachments=true&attachment_fields=all&member_fields=all&memberVoted_fields=all&checklists=all&checklist_fields=all&board=true&board_fields=all&list=true&pluginData=true&stickers=true&sticker_fields=all");
        return this;
    }
    
    return this;
}
