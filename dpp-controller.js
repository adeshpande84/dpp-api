
"use strict";

require('dotenv').config();
var sql = require('mssql');
var _ = require('lodash');
var ldap = require('ldapjs');

var cp = null;

/*var connect = function() {
	if(cp) {
			
			return cp;
		}
		
		
		cp = new Promise(function(resolve,reject) {
			
			var conn = new sql.ConnectionPool(config, function(err) {
				if(err) {
					cp = null;
					reject(err);
				}
				resolve(conn);
			});
		});

		return cp;
}*/

var getPool = function() {
        //IP-241 1.01 ASD 21 Sep 2018 Fix connection issue when importing applications
		return new sql.ConnectionPool(config);
    };

//connect to the server
var connect = function() {
    
    //var self = this;

	return new Promise(function(resolve, reject) {
		var pool = getPool();

		resolve(pool.connect());
	});

};

var saveIntoAdminTable = function(tableName,spName,inputVarName,inputJson) {


	return connect()
		.then(function(conn) {				
			
			//Create a mssql request object for given connection
			var request = conn.request();
			
			request = request.input(inputVarName,sql.VarChar('max'),JSON.stringify(inputJson));
			request = request.output('output_json',sql.VarChar('max'));

			//execute the stored procedure and return the result set
			return request.execute(spName).then(function(result) {
				conn.close();
				
				return result.output.output_json;
			});

		})
		.catch(function(err) {
			return {
				error: 1,
				error_message: 'Could not save data into ' + tableName + ' table'
			};
			
		});
}

//Set the config object that will be used for making a connection to the Sql Server
var config = {
	user: process.env.NDPP_DB_USERNAME,
	password: process.env.NDPP_DB_PASSWORD,
	server: process.env.NDPP_DB_HOST,
	database: process.env.NDPP_DB_NAME
	
};


function DppController(){

};

DppController.prototype = (function() {
	return {
		getAdminTableData: function(request, reply) {
			
			return connect()
				.then((conn) => {				
					
					var tables = request.query.tables;
					
					
					//Create a mssql request object for given connection
					var sqlRequest = conn.request();
					
					if(typeof request.query == 'undefined' || typeof tables == 'undefined' || tables == '' || tables == null) {
						sqlRequest = sqlRequest.input('input_json',sql.VarChar('max'),null);
					} else {
						var inputJson = {data: {tables: tables.split(",")}};
						console.log(inputJson);
						sqlRequest = sqlRequest.input('input_json',sql.VarChar('max'),JSON.stringify(inputJson));
					}

					sqlRequest = sqlRequest.output('output_json',sql.VarChar('max'));

					//execute the stored procedure and return the result set
					sqlRequest.execute('Get_AdminConfigData').then(function(result) {
						conn.close();
						
						reply(result.output.output_json);
					});

				})
				.catch(function(err) {
					console.log(err);
				});
			
		},

		getCohorts: function(request, reply) {
			
			return connect()
				.then(function(conn) {				
					
					//Create a mssql request object for given connection
					var sqlRequest = conn.request();

					var inputJson = null;
					
					if(typeof request.query != 'undefined' && typeof request.query.coachUserName != 'undefined' && request.query.coachUserName != '' && request.query.coachUserName != null) {
						inputJson = {data: {coach_username: request.query.coachUserName}};
						sqlRequest = sqlRequest.input('input_json',sql.VarChar('max'),JSON.stringify(inputJson));
					} else {
						inputJson = {data: {coach_username: null}};
						sqlRequest = sqlRequest.input('input_json',sql.VarChar('max'),null);
					}
					console.log(inputJson);
					sqlRequest = sqlRequest.output('output_json',sql.VarChar('max'));
					
					//execute the stored procedure and return the result set
					sqlRequest.execute('Get_Cohorts').then(function(result) {
						conn.close();
						
						reply(result.output.output_json);
					});

				})
				.catch(function(err) {
					console.log(err);
				});
			
		},

		getCohort: function(request, reply) {
			
			var cohortId = request.params.id;
			console.log('cohortId:',cohortId);
			return connect()
				.then((conn) => {				
					
					//Create a mssql request object for given connection
					var sqlRequest = conn.request();
					var inputJson = {data: {cohort_id: cohortId}};

					sqlRequest = sqlRequest.input('input_json',sql.VarChar('max'),JSON.stringify(inputJson));
					sqlRequest = sqlRequest.output('output_json',sql.VarChar('max'));
					//execute the stored procedure and return the result set
					sqlRequest.execute('Get_Cohort').then(function(result) {
						conn.close();
						
						console.log('cohortdata:', typeof result.output.output_json);
						console.log(result.output.output_json);
						reply(result.output.output_json);
					});

				})
				.catch(function(err) {
					console.log(err);
				});
			
		},


		getParticipant: function(request, reply) {
			
			var participantId = request.params.id;
			console.log('participantId:',participantId);
			return connect()
				.then(function(conn) {				
					
					//Create a mssql request object for given connection
					var sqlRequest = conn.request();
					
					var inputJson = {data: {participant_id: participantId}};

					sqlRequest = sqlRequest.input('input_json',sql.VarChar('max'),JSON.stringify(inputJson));
					sqlRequest = sqlRequest.output('output_json',sql.VarChar('max'));
					console.log(JSON.stringify(inputJson));
					//execute the stored procedure and return the result set
					sqlRequest.execute('Get_Participant').then(function(result) {
						conn.close();
						//return result;
						//console.log(result.recordset[0].json_out);

						var participant = JSON.parse(result.output.output_json);

						reply(participant);
					});

				})
				.catch(function(err) {
					console.log(err);
				});
			
		},

		getSessions: function(req, reply) {
			
			var participantId = req.query.participantId;
			console.log('getSessions',participantId);
			
			return connect()
				.then(function(conn) {				
					
					//Create a mssql request object for given connection
					var request = conn.request();
					
					request = request.input('participantId',sql.Int,participantId);

					//execute the stored procedure and return the result set
					request.execute('Get_Sessions').then(function(result) {
						conn.close();
						//return result;
						//console.log(result.recordset[0].json_out);
						reply(result.recordset[0].json_out)
					});

				})
				.catch(function(err) {
					console.log(err);
				});
			
		},

		lookupCoaches: function(req, reply) {

			var client = ldap.createClient({
			  url: process.env.NDPP_LDAP_URL
			});

			var queryVal = req.query.val;
			
			var filterStr = '(|(cn=*'+ queryVal +'*)(dnqualifier=*'+queryVal+'*))';
			var opts = {
			  filter: filterStr,
			  scope: 'sub',
			  attributes: ['dnqualifier','cn']
			};

			var coaches = [];

			client.bind(process.env.NDPP_LDAP_USER, process.env.NDPP_LDAP_PASSWORD, function(err,res) {
			  //assert.ifError(err);
			  	//console.log('bind err',err);
			  	//console.log('bind res',res);
			  	client.search(process.env.NDPP_LDAP_SEARCH_BASE, opts, function(errSearch, resSearch) {
					//console.log(errSearch,resSearch);	
				  //assert.ifError(err);

					resSearch.on('searchEntry', function(entry) {
						//console.log('entry: ' + JSON.stringify(entry.object));
						var coach = {
							coach_username: entry.object.dnqualifier,
							coach_name: entry.object.cn
						};

						coaches.push(coach);
					});
					resSearch.on('searchReference', function(referral) {
						//console.log('referral: ' + referral.uris.join());
					});
					resSearch.on('error', function(err1) {
						console.error('error: ' + err1.message);
					});
					resSearch.on('end', function(result) {
						//console.log('status: ' + result.status);
						reply(coaches);
					});
				});

			});
		},

		saveProgram: function(req, reply) {
			console.log(req.payload);

			return connect()
				.then(function(conn) {				
					
					//Create a mssql request object for given connection
					var request = conn.request();
					
					request = request.input('program_json',sql.VarChar('max'),JSON.stringify(req.payload));
					request = request.output('output_json',sql.VarChar('max'));

					//execute the stored procedure and return the result set
					request.execute('Save_Program').then(function(result) {
						conn.close();
						//return result;
						//console.log(result.recordset[0].json_out);
						reply(result.output)
					});

				})
				.catch(function(err) {
					reply({
						error: 1,
						error_message: 'Could not save program data into the database'
					});
					//console.log(err);
				});
		},

		saveTopic: function(req, reply) {
			console.log(req.payload);
			console.log(typeof req.payload);
			console.log(JSON.stringify(req.payload));
			//reply(JSON.stringify(req.payload));
			return saveIntoAdminTable('topic','Save_Topic','topic_json',req.payload)
				.then(function(resultJson) {
					reply(resultJson);
				})
				.catch(function(errJson) {
					reply(errJson);
				});

		},
		
		saveEnrollmentSource: function(req, reply) {
			console.log(req.payload);
			console.log(typeof req.payload);
			console.log(JSON.stringify(req.payload));
			//reply(JSON.stringify(req.payload));
			return saveIntoAdminTable('enrollment_source','Save_EnrollmentSource','enrollment_source_json',req.payload)
				.then(function(resultJson) {
					reply(resultJson);
				})
				.catch(function(errJson) {
					reply(errJson);
				});

		},

		savePayerType: function(req, reply) {
			console.log(req.payload);
			console.log(typeof req.payload);
			console.log(JSON.stringify(req.payload));
			//reply(JSON.stringify(req.payload));
			return saveIntoAdminTable('payer_type','Save_PayerType','payer_type_json',req.payload)
				.then(function(resultJson) {
					reply(resultJson);
				})
				.catch(function(errJson) {
					reply(errJson);
				});

		},

		saveEthnicity: function(req, reply) {
			console.log(req.payload);
			console.log(typeof req.payload);
			console.log(JSON.stringify(req.payload));
			//reply(JSON.stringify(req.payload));
			return saveIntoAdminTable('ethnicity','Save_Ethnicity','ethnicity_json',req.payload)
				.then(function(resultJson) {
					reply(resultJson);
				})
				.catch(function(errJson) {
					reply(errJson);
				});

		},

		saveRace: function(req, reply) {
			console.log(req.payload);
			console.log(typeof req.payload);
			console.log(JSON.stringify(req.payload));
			//reply(JSON.stringify(req.payload));
			return saveIntoAdminTable('race','Save_Race','race_json',req.payload)
				.then(function(resultJson) {
					reply(resultJson);
				})
				.catch(function(errJson) {
					reply(errJson);
				});

		},

		saveEducationLevel: function(req, reply) {
			console.log(req.payload);
			console.log(typeof req.payload);
			console.log(JSON.stringify(req.payload));
			//reply(JSON.stringify(req.payload));
			return saveIntoAdminTable('education_level','Save_EducationLevel','education_level_json',req.payload)
				.then(function(resultJson) {
					reply(resultJson);
				})
				.catch(function(errJson) {
					reply(errJson);
				});

		},

		saveSessionType: function(req, reply) {
			console.log(req.payload);
			console.log(typeof req.payload);
			console.log(JSON.stringify(req.payload));
			//reply(JSON.stringify(req.payload));
			return saveIntoAdminTable('session_type','Save_SessionType','session_type_json',req.payload)
				.then(function(resultJson) {
					reply(resultJson);
				})
				.catch(function(errJson) {
					reply(errJson);
				});

		},

		saveDeliveryMode: function(req, reply) {
			console.log(req.payload);
			console.log(typeof req.payload);
			console.log(JSON.stringify(req.payload));
			//reply(JSON.stringify(req.payload));
			return saveIntoAdminTable('delivery_mode','Save_DeliveryMode','delivery_mode_json',req.payload)
				.then(function(resultJson) {
					reply(resultJson);
				})
				.catch(function(errJson) {
					reply(errJson);
				});

		},

		savePrediabetesDetermination: function(req, reply) {
			console.log(req.payload);
			console.log(typeof req.payload);
			console.log(JSON.stringify(req.payload));
			
			return saveIntoAdminTable('prediabetes_test','Save_PrediabetesDetermination','prediabetes_test_json',req.payload)
				.then(function(resultJson) {
					console.log('prediabetes_test resultJson',resultJson);
					reply(resultJson);
				})
				.catch(function(errJson) {
					reply(errJson);
				});
			
		},

		saveCoach: function(req, reply) {
			console.log(req.payload);
			console.log(typeof req.payload);
			console.log(JSON.stringify(req.payload));
			//reply(JSON.stringify(req.payload));

			return connect()
				.then(function(conn) {				
					
					//Create a mssql request object for given connection
					var request = conn.request();
					
					request = request.input('coach_json',sql.VarChar('max'),JSON.stringify(req.payload));
					request = request.output('output_json',sql.VarChar('max'));

					//execute the stored procedure and return the result set
					request.execute('Save_Coach').then(function(result) {
						conn.close();
						//return result;
						//console.log(result.recordset[0].json_out);
						reply(result.output.output_json)
					});

				})
				.catch(function(err) {
					reply({
						error: 1,
						error_message: 'Could not save coach data into the database'
					});
					//console.log(err);
				});
			
		},

		saveCohort: function(req, reply) {
			console.log(req.payload);
			console.log(typeof req.payload);
			console.log(JSON.stringify(req.payload));
			//reply(JSON.stringify(req.payload));

			return connect()
				.then(function(conn) {				
					
					//Create a mssql request object for given connection
					var request = conn.request();
					
					request = request.input('cohort_json',sql.VarChar('max'),JSON.stringify(req.payload));
					request = request.output('output_json',sql.VarChar('max'));

					//execute the stored procedure and return the result set
					request.execute('Save_Cohort').then(function(result) {
						conn.close();
						//return result;
						//console.log(result.recordset[0].json_out);
						reply(result.output.output_json);
					});

				})
				.catch(function(err) {
					console.log(err);
					reply({
						error: 1,
						error_message: 'Could not save cohort data into the database'
					});
					//console.log(err);
				});
			
		},

		saveParticipant: function(req, reply) {
			console.log(req.payload);
			console.log(typeof req.payload);
			console.log(JSON.stringify(req.payload));
			//reply(JSON.stringify(req.payload));

			return connect()
				.then(function(conn) {				
					
					//Create a mssql request object for given connection
					var request = conn.request();
					
					request = request.input('participant_json',sql.VarChar('max'),JSON.stringify(req.payload));
					request = request.output('output_json',sql.VarChar('max'));

					//execute the stored procedure and return the result set
					request.execute('Save_Participant').then(function(result) {
						conn.close();
						//return result;
						//console.log(result.recordset[0].json_out);
						reply(result.output.output_json);
					});

				})
				.catch(function(err) {
					console.log(err);
					reply({
						error: 1,
						error_message: 'Could not save participant data into the database'
					});
					//console.log(err);
				});
			
		},

		saveSession: function(req, reply) {
			console.log(req.payload);
			console.log(typeof req.payload);
			console.log(JSON.stringify(req.payload));
			//reply(JSON.stringify(req.payload));

			return connect()
				.then(function(conn) {				
					
					//Create a mssql request object for given connection
					var request = conn.request();
					
					request = request.input('session_json',sql.VarChar('max'),JSON.stringify(req.payload));
					request = request.output('output_json',sql.VarChar('max'));

					//execute the stored procedure and return the result set
					request.execute('Save_Session').then(function(result) {
						conn.close();
						//return result;
						//console.log(result.recordset[0].json_out);
						reply(result.output.output_json);
					});

				})
				.catch(function(err) {
					console.log(err);
					reply({
						error: 1,
						error_message: 'Could not save Save_Session data into the database'
					});
					//console.log(err);
				});
			
		},

		getDataSubmissionReport: function(request, reply) {
						
			return connect()
				.then((conn) => {				
					
					var inputJson = {data: {}};

					var from_date = '';

					if(typeof request.query != 'undefined' && typeof request.query.fromDate != 'undefined' && request.query.fromDate != null) {						
						inputJson.data.from_date = request.query.fromDate;				
					}

					var to_date = '';

					if(typeof request.query != 'undefined' && typeof request.query.toDate != 'undefined' && request.query.toDate != null) {
						inputJson.data.to_date = request.query.toDate;						
					}

					var replace_null_with = '';

					if(typeof request.query != 'undefined' && typeof request.query.replaceValue != 'undefined' && request.query.replaceValue != null) {
						inputJson.data.replace_null_with = request.query.replaceValue;					
					}

					console.log(inputJson);

					//inputJson = {data: {coach_username: request.query.coachUserName}};
					//Create a mssql request object for given connection
					var sqlRequest = conn.request();
					//var inputJson = {data: {cohort_id: cohortId}};
					sqlRequest = sqlRequest.input('input_json',sql.VarChar('max'),JSON.stringify(inputJson));

					//sqlRequest = sqlRequest.input('input_json',sql.VarChar('max'),null);
					sqlRequest = sqlRequest.output('output_json',sql.VarChar('max'));
					//execute the stored procedure and return the result set
					sqlRequest.execute('Get_DataSubmissionReport').then(function(result) {
						conn.close();
						
						console.log('reportdata:', typeof result.output.output_json);
						//console.log(result.output.output_json);

						

						reply(result.output.output_json);
					});

				})
				.catch(function(err) {
					console.log(err);
				});
			
		},		

		getParticipantEvaluationReport: function(request, reply) {
						
			return connect()
				.then((conn) => {				
					
					
					var sqlRequest = conn.request();
					
					sqlRequest = sqlRequest.input('input_json',sql.VarChar('max'),null);
					
					sqlRequest = sqlRequest.output('output_json',sql.VarChar('max'));
					//execute the stored procedure and return the result set
					sqlRequest.execute('Get_ParticipantEvaluationReport').then(function(result) {
						conn.close();
						
						console.log('reportdata:', typeof result.output.output_json);
						
						reply(result.output.output_json);
					});

				})
				.catch(function(err) {
					console.log(err);
				});
			
		}
	}
	
})();

//create an instance of the controller
var dppController = new DppController();

//export the controller instance
module.exports = dppController;