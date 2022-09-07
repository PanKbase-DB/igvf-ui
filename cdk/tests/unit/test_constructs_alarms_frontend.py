import pytest


from aws_cdk.assertions import Template


def test_constructs_alarms_frontend_initialize_frontend_alarms(stack, vpc, existing_resources, config):
    from aws_cdk.aws_ecs_patterns import ApplicationLoadBalancedFargateService
    from aws_cdk.aws_ecs_patterns import ApplicationLoadBalancedTaskImageOptions
    from aws_cdk.aws_ecs import ContainerImage
    from aws_cdk.aws_ec2 import SubnetSelection
    from aws_cdk.aws_ec2 import SubnetType
    from infrastructure.constructs.alarms.frontend import FrontendAlarms
    from infrastructure.constructs.alarms.frontend import FrontendAlarmsProps
    fargate_service = ApplicationLoadBalancedFargateService(
        stack,
        'FargateService',

        task_image_options=ApplicationLoadBalancedTaskImageOptions(
            image=ContainerImage.from_registry('some-test')
        ),
    )
    alarms = FrontendAlarms(
        stack,
        'FrontendAlarms',
        props=FrontendAlarmsProps(
            config=config,
            existing_resources=existing_resources,
            fargate_service=fargate_service,
        )
    )
    template = Template.from_stack(stack)
    template.has_resource_properties(
        'AWS::CloudWatch::Alarm',
        {
            'ComparisonOperator': 'GreaterThanOrEqualToThreshold',
            'EvaluationPeriods': 2,
            'AlarmActions': [
                {
                    'Ref': 'TestTopic339EC197'
                }
            ],
            'Dimensions': [
                {
                    'Name': 'ClusterName',
                    'Value': {
                        'Ref': 'EcsDefaultClusterMnL3mNNYN926A5246'
                    }
                },
                {
                    'Name': 'ServiceName',
                    'Value': {
                        'Fn::GetAtt': [
                            'FargateServiceECC8084D',
                            'Name'
                        ]
                    }
                }
            ],
            'MetricName': 'CPUUtilization',
            'Namespace': 'AWS/ECS',
            'OKActions': [
                {
                    'Ref': 'TestTopic339EC197'
                }
            ],
            'Period': 300,
            'Statistic': 'Average',
            'Threshold': 85
        }
    )
    template.has_resource_properties(
        'AWS::CloudWatch::Alarm',
        {
            'ComparisonOperator': 'GreaterThanOrEqualToThreshold',
            'EvaluationPeriods': 1,
            'AlarmActions': [
                {
                    'Ref': 'TestTopic339EC197'
                }
            ],
            'Dimensions': [
                {
                    'Name': 'ClusterName',
                    'Value': {
                        'Ref': 'EcsDefaultClusterMnL3mNNYN926A5246'
                    }
                },
                {
                    'Name': 'ServiceName',
                    'Value': {
                        'Fn::GetAtt': [
                            'FargateServiceECC8084D',
                            'Name'
                        ]
                    }
                }
            ],
            'MetricName': 'MemoryUtilization',
            'Namespace': 'AWS/ECS',
            'OKActions': [
                {
                    'Ref': 'TestTopic339EC197'
                }
            ],
            'Period': 300,
            'Statistic': 'Average',
            'Threshold': 80
        }
    )
    template.has_resource_properties(
        'AWS::CloudWatch::Alarm',
        {
            'ComparisonOperator': 'GreaterThanOrEqualToThreshold',
            'EvaluationPeriods': 1,
            'AlarmActions': [
                {
                    'Ref': 'TestTopic339EC197'
                }
            ],
            'Dimensions': [
                {
                    'Name': 'LoadBalancer',
                    'Value': {
                        'Fn::GetAtt': [
                            'FargateServiceLBB353E155',
                            'LoadBalancerFullName'
                        ]
                    }
                }
            ],
            'MetricName': 'HTTPCode_Target_5XX_Count',
            'Namespace': 'AWS/ApplicationELB',
            'OKActions': [
                {
                    'Ref': 'TestTopic339EC197'
                }
            ],
            'Period': 300,
            'Statistic': 'Sum',
            'Threshold': 10
        }
    )
    template.resource_count_is(
        'AWS::CloudWatch::Alarm',
        3
    )
