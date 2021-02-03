<template>

    <div class="container">
        <form id="issues-form" onsubmit="return false" class="form-vertical">
            <h3>Feedback</h3> 
            <div class="divider" data-content="    "></div>
            <div class="divider-vert" data-content="    "></div> 
            <div class="columns">
                <div class="column">            
                    <h4>Details</h4> 
                    <fieldset>
                        <input class="form-input"  placeholder="Title" v-model="info.title" name="title" type="text" tabindex="1" required autofocus>
                    </fieldset>
                    <fieldset>
                        <textarea name="body" placeholder="Description ...." v-model="info.body" tabindex="5" rows="2" ></textarea>
                    </fieldset>
                    <fieldset>
                        <legend>Type</legend>
                        <label class="form-radio">
                        <input type="radio"  tabindex="2" v-model="info.type" value="bug" ><i class="form-icon"></i> Bug
                        </label>
                        <label class="form-radio">
                        <input type="radio"  tabindex="3" v-model="info.type" value="feature" ><i class="form-icon"></i> Enhancement Request
                        </label>
                    </fieldset>
                    <fieldset>
                        <legend>Priority</legend>
                        <label class="form-radio form-inline" style="color:red">
                        <input type="radio"  checked="" v-model="info.priority" value="high" ><i class="form-icon"></i> High 
                        </label>
                        <label class="form-radio form-inline" style="color:orange" >
                        <input type="radio" style="color:#f00" v-model="info.priority" value="medium" ><i class="form-icon"></i> Medium
                        </label> 
                        <label class="form-radio form-inline" style="color:grey">
                        <input type="radio" v-model="info.priority" value="low" ><i class="form-icon" ></i> Low
                        </label>
                    </fieldset>                    
                    </fieldset-->
                </div>
                <div class="divider-vert" data-content="    "></div>
                <div class="column">
                    <h4>Your Contact</h4>  
                    <fieldset>
                        <input class="form-input"  placeholder="Your Name" name="name" v-model="info.name" type="text" tabindex="1" required autofocus>
                    </fieldset>
                    <fieldset>
                        
                        <input class="form-input" type="email" id="input-email" placeholder="Your Email Address" v-model="info.email" value="" pattern="[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$">
                    </fieldset>
                    <fieldset>
                        <input class="form-input" placeholder="Your Phone Number (optional)" type="tel" v-model="info.phone" tabindex="3" >
                    </fieldset>
                    <fieldset style="margin-top:20px;height:130px;">
                        <p class="error" v-if="errors.length">
                            <ul>
                               <li v-for="error in errors">{{ error }}</li>
                            </ul>
                        </p>
                        <label v-if="info.issueResponse" style="text-align:center" ><h5 style="color:#5e7f2b;">Thank You for Submitting Feedback !</h5><br> <p class="error"> Your Ticket Reference #{{ info.issueResponse.iid }} </p></label>
                    </fieldset>
                    <fieldset >
                           <button v-bind:class="{'btn':true, 'loading':isProcessing }" name="submit" v-on:click="submitIssue" id="issue-submit" >Submit </button>
                    </fieldset>
                </div>           
            </div>
        </form>
    </div>

</template>

<script>

import spectre from 'spectre.css';
import icon from 'spectre.css/dist/spectre-icons.css';
import Vue from "vue";
import { request } from '@esri/arcgis-rest-request';

const axios = require('axios');

const PRIVATE_TOKEN = "";
const PROJECT_NUMBER = "";
const WEBHOOK_URL = "";
const PROJECT_OWNER = "";


export default {    
    data(){
        return{
           info:{
               title:null,
               body:null,
               type:"bug",
               priority:"high",
               name:null,
               email:null,
               phone:null,
               attachment:null,
               issueResponse:null
           },
           errors:[],
           token:null,
           projectName:null,
           isProcessing:false

        }
        
    },
    methods:  {
        handleAttachment:function(e){
            this.isProcessing = true;
             const selectedImage = e.target.files[0];
             this.createBase64Image(selectedImage);
        },
        createBase64Image(fileObject){
            const reader = new FileReader();
            reader.onload = (e) => {
                console.log(e.target.result);
                this.uploadAttachment(e.target.result);
            }
            reader.readAsDataURL(fileObject);
        },
        uploadAttachment:function(e){
            let buff = Buffer.from(e,'base64');
            console.log(buff);
            let header = {
                'PRIVATE-TOKEN': PRIVATE_TOKEN 
            }

            let formInfo = {
                file:buff
            }

            var formData = new FormData();
            for (var key in formInfo ) {
                formData.append(key, formInfo[key])
            }
            console.log({"file":buff});
            axios.post(`https://gitlab.com/api/v4/projects/${PROJECT_NUMBER}/uploads`, {"file":"@"+buff},{headers:{'PRIVATE-TOKEN': PRIVATE_TOKEN }}).then( (response) => {
                console.log(response);
                
                //console.log(response.data[0].iid);
                this.isProcessing = false;
            })
            .catch(function (error) {
                console.log(error);
                this.isProcessing = false;
            });
        },
        validEmail: function (email) {
            var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        },
        submitIssue:function(){
           
            this.errors = [];
           
            if(!this.info.title){
               this.errors.push("Issue Title Required")
            }
            
            if(!this.info.body){
               this.errors.push("Issue Description Required")
            }

            if(!this.info.name){
               this.errors.push("Contact Name Requires")
            }
                        
            if(!this.info.email){
                if(!this.validEmail(this.info.email)){
                    this.errors.push("Enter Valid Email")
                }
            }
        
            if (this.errors.length) {
                return false;
            }
   
           let formInfo = {
                projectOwner:PROJECT_OWNER,
                token:this.token,
                projectName:this.projectName,
                title:this.info.title,
                body:this.info.body + "<br><br>" + "Contact Info :" + this.info.name + "<br>" + this.info.email + "<br>" + this.info.phone,
                label:["type/" + this.info.type, "priority/"+this.info.priority]
                
            }

            this.isProcessing = true;
            var formData = new FormData();
            for (var key in formInfo ) {
                formData.append(key, formInfo[key])
            }
            
            axios.post(WEBHOOK_URL, formData).then( (response) => {
                if(response.data[0].hasOwnProperty("error")){
                     this.errors.push("Error Connecting Service");
                      this.info.issueResponse = null;
                }else{
                   this.info.issueResponse = response.data[0];
                   this.errors = [];
                }
                
                //console.log(response.data[0].iid);
                this.isProcessing = false;
            })
            .catch(function (error) {
                console.log(error);
                this.isProcessing = false;
            })
        }
    },
    created:function(){
        let url = new URL(window.location.href);
        let token = url.searchParams.get("token");
        let project = url.searchParams.get("project");
        
        if(project && token){
            this.token = token;
            this.projectName =  project
            
        }
        
    }
}

</script>


<style scoped>
    #app{
        font-family: "Roboto", Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        margin-top: 20px;
        background: none;
    }

    ::placeholder {
        color : lightgray;
        opacity: 1; /* Firefox */
    }

    fieldset {
        border: medium none !important;
        margin: 0 0 10px;
        min-width: 100%;
        padding: 0;
        width: 100%;
    }

    fieldset legend {
        margin-bottom:0.1em;
    }

   .form-label {
        background-color:#5e7f2b;
        color:#fff;
        font-weight:bold;
        text-align:center;
        opacity:0.7;
    } 

    .container {
        margin: 0 auto;
        position: relative;
        color: #777;
        border: 0px solid #000;
        width: 100%;
        height: 100%;
        position: absolute;
    }

    #issues-form {
        padding: 25px;
        /*box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.2), 0 5px 5px 0 rgba(0, 0, 0, 0.24);*/
    }

    #issues-form h3 {
        display: block;
        font-size: 30px;
        font-weight: 300;
        margin-bottom: 10px;
    }

    #issues-form h3 {
        text-align:center;
    }
    
    #issues-form h4 {
        margin: 5px 0 15px;
        display: block;
        font-size:20px;
        font-weight: 400;
    }

    #issues-form input[type="text"],#issues-form textarea {
        width: 100%;
        border: 1px solid #ccc;
        background: #FFF;
        margin: 0 0 5px;
        padding: 10px;
    } 

    #issues-form textarea {
        height: 80px;
        max-width: 100%;
        resize: none;
    }
    

    #issues-form button[name="submit"] {
        cursor: pointer;
        width: 100%;
        border: none;
        background: #4CAF50;
        color: #FFF;
        margin: 0 0 0px;
        font-size: 15px;
    }

    #issues-form button[name="submit"]:hover {
        background: #43A047;
        -webkit-transition: background 0.3s ease-in-out;
        -moz-transition: background 0.3s ease-in-out;
        transition: background-color 0.3s ease-in-out;
    }

    #issues-form button[name="submit"]:active {
        box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.5);
        background-color:#5e7f2b;
    }

    .error{
        color:#f00;
    }

    /* Spectre css changes */
    .form-checkbox input:checked + .form-icon, .form-radio input:checked + .form-icon, .form-switch input:checked + .form-icon {
        background: #5e7f2b;
        border-color: #5e7f2b;
    }



</style>