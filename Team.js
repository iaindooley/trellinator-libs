/**
* @class Team
* @memberof module:TrelloEntities
* @constructor
*/
var Team = function(data)
{    
    this.data       = data;
    this.board_list = null;

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Team
    * @example
    * new Notification(posted).board().id();
    */
    this.id = function()
    {
        return this.data.id;
    }
  
    /**
    * Ohai there
    * @memberof module:TrelloEntities.Team
    * @example
    * new Notification(posted).board().id();
    */
    this.name = function()
    {
        if(!this.data.displayName)
            this.load();

        return this.data.displayName;
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Team
    * @example
    * new Notification(posted).board().id();
    */
    this.board = function(data)
    {
        return this.boards(data).first();
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Team
    * @example
    * new Notification(posted).board().id();
    */
    this.boards = function(data)
    {
        if(!this.board_list)
        {
            this.board_list= new IterableCollection(TrelloApi.get("organizations/"+this.data.id+"/boards?filter=open&fields=all")).transform(function(elem)
            {
                return new Board(elem);
            });
        }

        return this.board_list.findByName(data);
    }
    
    this.addMember = function(email,full_name,type)
    {
        if(!type)
            type = "normal";

        TrelloApi.put("organizations/"+this.id()+"/members?email="+encodeURIComponent(email)+"&fullName="+encodeURIComponent(full_name)+"&type="+encodeURIComponent(type));
        return this;
    }

    /**
    * Ohai there
    * @memberof module:TrelloEntities.Team
    * @example
    * new Notification(posted).board().id();
    */
    this.load = function()
    {
        this.board_list = null;
        this.data = TrelloApi.get("organizations/"+this.data.id);
        return this;
    }
}
