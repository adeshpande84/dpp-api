
"use strict";

require('dotenv').config();
/* Controller that handles the requests */
var dppController = require('./dpp-controller.js');

module.exports = function() {
	return [
		
		{
			method: 'GET',
			path: '/adminData',
			config: {
				auth: false,
				handler: dppController.getAdminTableData
			}

		},
		{
			method: 'GET',
			path: '/cohorts',
			config: {
				auth: false,
				handler: dppController.getCohorts
			}

		},
		{
			method: 'GET',
			path: '/cohorts/{id}',
			config: {
				auth: false,
				handler: dppController.getCohort
			}

		},
		{
			method: 'GET',
			path: '/participants/{id}',
			config: {
				auth: false,
				handler: dppController.getParticipant
			}

		},
		{
			method: 'GET',
			path: '/sessions',
			config: {
				auth: false,
				handler: dppController.getSessions
			}

		},
		{
			method: 'GET',
			path: '/coach-lookup',
			config: {
				auth: false,
				handler: dppController.lookupCoaches
			}
		},
		{
			method: 'POST',
			path: '/coaches',
			config: {
				auth: false,
				handler: dppController.saveCoach
			}
		},
		{
			method: 'POST',
			path: '/programs',
			config: {
				auth: false,
				handler: dppController.saveProgram
			}
		},
		{
			method: 'POST',
			path: '/topics',
			config: {
				auth: false,
				handler: dppController.saveTopic
			}
		},
		{
			method: 'POST',
			path: '/enrollment-sources',
			config: {
				auth: false,
				handler: dppController.saveEnrollmentSource
			}
		},
		{
			method: 'POST',
			path: '/payer-types',
			config: {
				auth: false,
				handler: dppController.savePayerType
			}
		},
		{
			method: 'POST',
			path: '/ethnicities',
			config: {
				auth: false,
				handler: dppController.saveEthnicity
			}
		},
		{
			method: 'POST',
			path: '/races',
			config: {
				auth: false,
				handler: dppController.saveRace
			}
		},
		{
			method: 'POST',
			path: '/education-levels',
			config: {
				auth: false,
				handler: dppController.saveEducationLevel
			}
		},
		{
			method: 'POST',
			path: '/session-types',
			config: {
				auth: false,
				handler: dppController.saveSessionType
			}
		},
		{
			method: 'POST',
			path: '/delivery-modes',
			config: {
				auth: false,
				handler: dppController.saveDeliveryMode
			}
		},
		{
			method: 'POST',
			path: '/prediabetes-determinations',
			config: {
				auth: false,
				handler: dppController.savePrediabetesDetermination
			}
		},
		{
			method: 'POST',
			path: '/cohorts',
			config: {
				auth: false,
				handler: dppController.saveCohort
			}
		},
		{
			method: 'POST',
			path: '/participants',
			config: {
				auth: false,
				handler: dppController.saveParticipant
			}
		},
		{
			method: 'POST',
			path: '/sessions',
			config: {
				auth: false,
				handler: dppController.saveSession
			}
		},
		{
			method: 'GET',
			path: '/reports/data-submission',
			config: {
				auth: false,
				handler: dppController.getDataSubmissionReport
			}
		},
		{
			method: 'GET',
			path: '/reports/participant-evaluation',
			config: {
				auth: false,
				handler: dppController.getParticipantEvaluationReport
			}
		}
	];
}();



